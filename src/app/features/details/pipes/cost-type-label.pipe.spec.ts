import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';
import { CostTypeLabelPipe } from './cost-type-label.pipe';

describe('CostTypeLabelPipe', () => {
  it('labels the cost type', () => {
    expect(new CostTypeLabelPipe().transform(TypeCostCharging.PerkWh)).toBe('per kWh');
  });
});
