import { configureSwitchCmd, SwitchConfig } from '../commands/configure-switch';
import { Switch } from '../hardware/switch';

describe('configure-switch', () => {
  describe('configureSwitchCmd', () => {
    test('should generate correct command with numeric switchId and default values', () => {
      const config: SwitchConfig = {
        switchId: 5
      };

      const result = configureSwitchCmd(config);

      // Expected format: SL:switchId,mode,debounceClose,debounceOpen\r
      // switchId: 5 -> '05' in hex
      // mode: not inverted -> '1'
      // debounceClose: default 2ms -> '02' in hex
      // debounceOpen: default 20ms -> '14' in hex
      expect(result).toBe('SL:05,1,02,14\r');
    });

    test('should generate correct command with Switch object and default values', () => {
      const config: SwitchConfig = {
        switchId: new Switch(10)
      };

      const result = configureSwitchCmd(config);

      // switchId: 10 -> '0a' in hex
      expect(result).toBe('SL:0a,1,02,14\r');
    });

    test('should generate correct command with custom debounce values', () => {
      const config: SwitchConfig = {
        switchId: 7,
        debounceCloseMs: 5,
        debounceOpenMs: 30
      };

      const result = configureSwitchCmd(config);

      // switchId: 7 -> '07' in hex
      // mode: not inverted -> '1'
      // debounceClose: 5ms -> '05' in hex
      // debounceOpen: 30ms -> '1e' in hex
      expect(result).toBe('SL:07,1,05,1e\r');
    });

    test('should generate correct command with inverted mode', () => {
      const config: SwitchConfig = {
        switchId: 3,
        inverted: true
      };

      const result = configureSwitchCmd(config);

      // mode: inverted -> '2'
      expect(result).toBe('SL:03,2,02,14\r');
    });

    test('should generate correct command with all custom values', () => {
      const config: SwitchConfig = {
        switchId: new Switch(15),
        debounceCloseMs: 1,
        debounceOpenMs: 50,
        inverted: true
      };

      const result = configureSwitchCmd(config);

      // switchId: 15 -> '0f' in hex
      // mode: inverted -> '2'
      // debounceClose: 1ms -> '01' in hex
      // debounceOpen: 50ms -> '32' in hex
      expect(result).toBe('SL:0f,2,01,32\r');
    });

    test('should generate correct command with zero debounce values', () => {
      const config: SwitchConfig = {
        switchId: 1,
        debounceCloseMs: 0,
        debounceOpenMs: 0
      };

      const result = configureSwitchCmd(config);

      // debounceClose: 0ms -> '00' in hex
      // debounceOpen: 0ms -> '00' in hex
      expect(result).toBe('SL:01,1,00,00\r');
    });

    test('should handle large switch ID values', () => {
      const config: SwitchConfig = {
        switchId: 255
      };

      const result = configureSwitchCmd(config);

      // switchId: 255 -> 'ff' in hex
      expect(result).toBe('SL:ff,1,02,14\r');
    });

    test('should handle partial debounce configuration (only close)', () => {
      const config: SwitchConfig = {
        switchId: 8,
        debounceCloseMs: 10
        // debounceOpenMs not specified, should use default
      };

      const result = configureSwitchCmd(config);

      // debounceClose: 10ms -> '0a' in hex
      // debounceOpen: default 20ms -> '14' in hex
      expect(result).toBe('SL:08,1,0a,14\r');
    });

    test('should handle partial debounce configuration (only open)', () => {
      const config: SwitchConfig = {
        switchId: 9,
        debounceOpenMs: 100
        // debounceCloseMs not specified, should use default
      };

      const result = configureSwitchCmd(config);

      // debounceClose: default 2ms -> '02' in hex
      // debounceOpen: 100ms -> '64' in hex
      expect(result).toBe('SL:09,1,02,64\r');
    });

    test('should handle inverted false explicitly', () => {
      const config: SwitchConfig = {
        switchId: 4,
        inverted: false
      };

      const result = configureSwitchCmd(config);

      // mode: not inverted (explicit false) -> '1'
      expect(result).toBe('SL:04,1,02,14\r');
    });
  });
});