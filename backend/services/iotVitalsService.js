const IotSensorReading = require('../models/IotSensorReading');

const DEFAULT_FAKE_DEVICE_ID = 'fake-hr-console';

const findLatestReading = (filter, fieldQuery) => {
  return IotSensorReading.findOne({
    ...filter,
    ...fieldQuery
  })
    .sort({ timestamp: -1 })
    .lean();
};

const getMergedLatestVitals = async (filter = {}, options = {}) => {
  const preferDeviceId = options.preferDeviceId || DEFAULT_FAKE_DEVICE_ID;

  const [tempReading, humidityReading] = await Promise.all([
    findLatestReading(filter, { temperature: { $ne: null } }),
    findLatestReading(filter, { humidity: { $ne: null } })
  ]);

  let hrReading = await findLatestReading(filter, {
    heartRate: { $ne: null },
    deviceId: preferDeviceId
  });

  if (!hrReading) {
    hrReading = await findLatestReading(filter, { heartRate: { $ne: null } });
  }

  const timestamps = [
    tempReading?.timestamp,
    humidityReading?.timestamp,
    hrReading?.timestamp
  ].filter(Boolean);

  if (timestamps.length === 0) return null;

  const mergedTimestamp = new Date(
    Math.max(...timestamps.map(ts => new Date(ts).getTime()))
  );

  return {
    temperature: tempReading?.temperature ?? null,
    humidity: humidityReading?.humidity ?? null,
    heartRate: hrReading?.heartRate ?? null,
    timestamp: mergedTimestamp,
    deviceId: hrReading?.deviceId || tempReading?.deviceId || humidityReading?.deviceId || '',
    rfidTag: hrReading?.rfidTag || tempReading?.rfidTag || humidityReading?.rfidTag || null,
    animalId: hrReading?.animalId || tempReading?.animalId || humidityReading?.animalId || null,
    sensorType: 'COMBINED'
  };
};

module.exports = {
  getMergedLatestVitals
};
