import { extractAppNames, getDependencies } from '../src/nx-etc';
import { getProjectNodes } from '@nrwl/schematics/src/command-line/shared';

jest.mock('@nrwl/schematics/src/command-line/affected-apps');

describe('nx-etc checkout', () => {
  describe('extractAppNames', () => {
    it('should remove the first argument from the array', () => {
      expect(extractAppNames(['a', 'b', 'c'])).toEqual(['b', 'c']);
    });
  });
});
