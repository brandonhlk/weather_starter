import { afterEach, describe, expect, it, vi } from 'vitest';
import { SingaporeWeatherClient } from './weather.js';

describe('SingaporeWeatherClient condition forecast', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retrieves the two-hour forecast and selects the nearest area condition', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          area_metadata: [
            { name: 'Bishan', label_location: { latitude: 1.350772, longitude: 103.839 } },
            { name: 'Bedok', label_location: { latitude: 1.321, longitude: 103.924 } },
          ],
          items: [
            {
              update_timestamp: '2026-09-06T20:00:00+08:00',
              valid_period: { text: '8 pm to 10 pm' },
              forecasts: [
                { area: 'Bishan', forecast: 'Partly Cloudy' },
                { area: 'Bedok', forecast: 'Light Rain' },
              ],
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const snapshot = await new SingaporeWeatherClient({
      baseUrl: 'https://api-open.data.gov.sg',
    }).getCurrentWeather(1.35, 103.84);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    );
    expect(snapshot).toMatchObject({
      condition: 'Partly Cloudy',
      area: 'Bishan',
      valid_period_text: '8 pm to 10 pm',
      source: 'api-open.data.gov.sg',
    });

  });

  it('populates weather metrics from the nearest readings and UV endpoint', async () => {
      const station = {
        id: 'S109',
        location: { latitude: 1.3793, longitude: 103.85 },
      };
      const readingPayload = (value: number) => ({
        code: 0,
        data: {
          stations: [station],
          readings: [{ timestamp: '2026-09-06T20:28:00+08:00', data: [{ stationId: 'S109', value }] }],
        },
      });
      const fetchMock = vi.fn().mockImplementation(async (url: string) => {
        if (url.endsWith('/two-hr-forecast')) {
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                area_metadata: [
                  { name: 'Bishan', label_location: { latitude: 1.350772, longitude: 103.839 } },
                ],
                items: [
                  {
                    update_timestamp: '2026-09-06T20:00:00+08:00',
                    forecasts: [{ area: 'Bishan', forecast: 'Cloudy' }],
                  },
                ],
              },
            }),
          };
        }
        if (url.endsWith('/air-temperature')) return { ok: true, json: async () => readingPayload(29.6) };
        if (url.endsWith('/relative-humidity')) return { ok: true, json: async () => readingPayload(82) };
        if (url.endsWith('/rainfall')) return { ok: true, json: async () => readingPayload(0.4) };
        if (url.endsWith('/wind-speed')) return { ok: true, json: async () => readingPayload(8) };
        if (url.endsWith('/wind-direction')) return { ok: true, json: async () => readingPayload(180) };
        if (url.endsWith('/uv')) {
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: { records: [{ updatedTimestamp: '2026-09-06T20:00:00+08:00', index: [{ value: 4 }] }] },
            }),
          };
        }
        if (url.endsWith('/twenty-four-hr-forecast')) {
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                records: [{
                  updatedTimestamp: '2026-09-06T20:00:00+08:00',
                  general: { temperature: { low: 25, high: 32 } },
                  periods: [
                    { timePeriod: { text: '8 pm to 10 pm' }, regions: { central: { text: 'Cloudy' } } },
                  ],
                }],
              },
            }),
          };
        }
        if (url.endsWith('/4-day-weather-forecast')) {
          return {
            ok: true,
            json: async () => ({
              items: [{
                update_timestamp: '2026-09-06T20:00:00+08:00',
                forecasts: [{
                  date: '2026-09-07',
                  forecast: 'Partly Cloudy',
                  temperature: { low: 26, high: 33 },
                }],
              }],
            }),
          };
        }
        if (url.endsWith('/psi') || url.endsWith('/pm25')) {
          const isPsi = url.endsWith('/psi');
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                regionMetadata: [
                  { name: 'central', labelLocation: { latitude: 1.35735, longitude: 103.82 } },
                ],
                items: [
                  {
                    updatedTimestamp: '2026-09-06T20:00:00+08:00',
                    readings: {
                      [isPsi ? 'psi_twenty_four_hourly' : 'pm25_one_hourly']: {
                        central: isPsi ? 42 : 8,
                      },
                    },
                  },
                ],
              },
            }),
          };
        }
        throw new Error(`Unexpected URL: ${url}`);
      });
      vi.stubGlobal('fetch', fetchMock);

      const snapshot = await new SingaporeWeatherClient().getCurrentWeather(1.35, 103.84);

      expect(snapshot).toMatchObject({
        condition: 'Cloudy',
        temperature_c: 29.6,
        humidity_percent: 82,
        rainfall_mm: 0.4,
        wind_speed_knots: 8,
        wind_direction_degrees: 180,
        uv_index: 4,
        psi_twenty_four_hourly: 42,
        pm25_one_hourly: 8,
        air_quality_region: 'central',
        forecast_low_c: 25,
        forecast_high_c: 32,
        forecast_periods: [{ label: '8 pm to 10 pm', forecast: 'Cloudy' }],
        daily_forecast: [{
          date: '2026-09-07',
          forecast: 'Partly Cloudy',
          temperature_low_c: 26,
          temperature_high_c: 33,
        }],
      });
      expect(fetchMock).toHaveBeenCalledTimes(11);
  });

  it('keeps available air quality data when one endpoint fails', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('/psi')) throw new Error('PSI unavailable');
      if (url.endsWith('/pm25')) {
        return {
          ok: true,
          json: async () => ({
            code: 0,
            data: {
              regionMetadata: [
                { name: 'central', labelLocation: { latitude: 1.35735, longitude: 103.82 } },
              ],
              items: [
                {
                  readings: { pm25_one_hourly: { central: 12 } },
                },
              ],
            },
          }),
        };
      }
      if (url.endsWith('/two-hr-forecast')) {
        return {
          ok: true,
          json: async () => ({
            code: 0,
            data: {
              area_metadata: [{ name: 'Bishan', label_location: { latitude: 1.35, longitude: 103.84 } }],
              items: [{ forecasts: [{ area: 'Bishan', forecast: 'Cloudy' }] }],
            },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ code: 0, data: { stations: [], readings: [] } }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const snapshot = await new SingaporeWeatherClient().getCurrentWeather(1.35, 103.84);

    expect(snapshot).toMatchObject({
      psi_twenty_four_hourly: null,
      pm25_one_hourly: 12,
      air_quality_region: 'central',
    });
  });
});
