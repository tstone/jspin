import { triggerToHex, DriverTrigger, configureDriverCmd } from '../commands/configure-driver';
import { PulseDriverConfig, PulseHoldDriverConfig } from '../hardware/driver';
import { Switch } from '../hardware/switch';

describe('configure-driver', () => {
  describe('triggerToHex', () => {
    test('should return "81" when trigger is enabled and disableSwitch is true', () => {
      const trigger: DriverTrigger = {
        enabled: true,
        oneShot: false,
        invertSwitch1: true,
        invertSwitch2: false,
        manual: false,
        disableSwitch: true
      };

      const result = triggerToHex(trigger);

      expect(result).toBe('91');
    });

    test('should return "0" when all trigger properties are false', () => {
      const trigger: DriverTrigger = {
        enabled: false,
        oneShot: false,
        invertSwitch1: false,
        invertSwitch2: false,
        manual: false,
        disableSwitch: false
      };

      const result = triggerToHex(trigger);

      expect(result).toBe('0');
    });
  });

  describe('configureDriverCmd', () => {
    describe('pulse', () => {
      test('should generate correct command for pulse mode config', () => {
        const pulseConfig: PulseDriverConfig = {
          mode: 'pulse',
          switch: new Switch(5),
          initialPwmDurationMs: 100,
          initialPwmPower: 255,
          secondaryPwmDurationMs: 50,
          secondaryPwmPower: 128,
          restMs: 200
        };

        const result = configureDriverCmd(10, pulseConfig);

        // Expected format: DL:driverId,trigger,switchId,mode,param1,param2,param3,param4,param5\r
        // driverId: 10 -> 'a' in hex
        // trigger: disableSwitch=false -> '0'
        // switchId: 5 in hex
        // mode: '10' (pulse mode)
        // param1: 100ms -> '64' in hex
        // param2: 255 power -> 'ff'
        // param3: 50ms -> '32' in hex
        // param4: 128 power -> '80' in hex
        // param5: 200ms -> 'c8' in hex
        expect(result).toBe('DL:0a,81,05,10,64,ff,32,80,c8\r');
      });
    });

    describe('pulse+hold', () => {
      test('should generate correct command for pulse hold mode config', () => {
        const pulseConfig: PulseHoldDriverConfig = {
          mode: 'pulse+hold',
          switch: new Switch(5),
          invertSwitch: true,
          initialPwmDurationMs: 100,
          initialPwmPower: 255,
          secondaryPwmPower: 128,
          restMs: 200
        };

        const result = configureDriverCmd(10, pulseConfig);
        expect(result).toBe('DL:0a,91,05,18,64,ff,80,c8,00\r');
      });
    });
  });
});
