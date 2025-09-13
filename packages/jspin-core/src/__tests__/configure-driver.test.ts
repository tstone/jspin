import { triggerToHex, DriverTrigger, configureDriverCmd } from '../commands/configure-driver';
import { PulseDriverConfig, PulseHoldCancelDriverConfig, PulseHoldDriverConfig, DelayedPulseDriverConfig, LongPulseDriverConfig } from '../hardware/driver';
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

    test('should return "00" when all trigger properties are false', () => {
      const trigger: DriverTrigger = {
        enabled: false,
        oneShot: false,
        invertSwitch1: false,
        invertSwitch2: false,
        manual: false,
        disableSwitch: false
      };

      const result = triggerToHex(trigger);

      expect(result).toBe('00');
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

    describe('delayed-pulse', () => {
      test('should generate correct command for delayed pulse mode config', () => {
        const delayedPulseConfig: DelayedPulseDriverConfig = {
          mode: 'delayed-pulse',
          switch: new Switch(7),
          delayTimeTenthMs: 50, // 500ms delay (50 * 10ms)
          initialPwmDurationMs: 100,
          initialPwmPower: 255,
          secondaryPwmDurationMs: 50,
          secondaryPwmPower: 128,
          restMs: 200
        };

        const result = configureDriverCmd(12, delayedPulseConfig);

        // Expected format: DL:driverId,trigger,switchId,mode,param1,param2,param3,param4,param5\r
        // driverId: 12 -> '0c' in hex
        // trigger: enabled, disableSwitch=true -> '81'
        // switchId: 7 -> '07' in hex
        // mode: '30' (delayed pulse mode)
        // param1: delay 50 (10ms units) -> '32' in hex
        // param2: initial duration 100ms -> '64' in hex
        // param3: initial power 255 -> 'ff' in hex
        // param4: secondary duration 50ms -> '32' in hex
        // param5: rest 200ms -> 'c8' in hex
        expect(result).toBe('DL:0c,81,07,30,32,64,ff,32,c8\r');
      });

      test('should generate correct command for delayed pulse with minimal config', () => {
        const delayedPulseConfig: DelayedPulseDriverConfig = {
          mode: 'delayed-pulse',
          switch: new Switch(3),
          delayTimeTenthMs: 10, // 100ms delay
          initialPwmDurationMs: 50,
          initialPwmPower: 200
        };

        const result = configureDriverCmd(5, delayedPulseConfig);

        // driverId: 5 -> '05' in hex
        // switchId: 3 -> '03' in hex
        // param1: delay 10 -> '0a' in hex
        // param2: initial duration 50ms -> '32' in hex
        // param3: initial power 200 -> 'c8' in hex
        // param4: undefined secondary duration -> '00' in hex
        // param5: undefined rest -> '00' in hex
        expect(result).toBe('DL:05,81,03,30,0a,32,c8,00,00\r');
      });
    });

    describe('long-pulse', () => {
      test('should generate correct command for long pulse mode config', () => {
        const longPulseConfig: LongPulseDriverConfig = {
          mode: 'long-pulse',
          switch: new Switch(9),
          initialPwmDurationMs: 75,
          initialPwmPower: 255,
          secondaryPwmDurationMs100: 150, // 15 seconds (150 * 100ms)
          secondaryPwmPower: 100,
          restMs: 200
        };

        const result = configureDriverCmd(8, longPulseConfig);

        // Expected format: DL:driverId,trigger,switchId,mode,param1,param2,param3,param4,param5\r
        // driverId: 8 -> '08' in hex
        // trigger: enabled, disableSwitch=true -> '81'
        // switchId: 9 -> '09' in hex
        // mode: '70' (long pulse mode)
        // param1: initial duration 75ms -> '4b' in hex
        // param2: initial power 255 -> 'ff' in hex
        // param3: secondary duration 150 (100ms units) -> '96' in hex
        // param4: secondary power 100 -> '64' in hex
        // param5: rest 200ms -> 'c8' in hex
        expect(result).toBe('DL:08,81,09,70,4b,ff,96,64,c8\r');
      });

      test('should generate correct command for long pulse with minimal config', () => {
        const longPulseConfig: LongPulseDriverConfig = {
          mode: 'long-pulse',
          switch: new Switch(1),
          initialPwmDurationMs: 25,
          initialPwmPower: 180,
          secondaryPwmDurationMs100: 80, // 8 seconds
          secondaryPwmPower: 60
        };

        const result = configureDriverCmd(2, longPulseConfig);

        // driverId: 2 -> '02' in hex
        // switchId: 1 -> '01' in hex
        // param1: initial duration 25ms -> '19' in hex
        // param2: initial power 180 -> 'b4' in hex
        // param3: secondary duration 80 -> '50' in hex
        // param4: secondary power 60 -> '3c' in hex
        // param5: undefined -> '00' in hex
        expect(result).toBe('DL:02,81,01,70,19,b4,50,3c,00\r');
      });
    });
  });
});
