import { Component, input, model } from '@angular/core';
import { IonCheckbox, IonItem, IonList, IonListHeader } from '@ionic/angular';
import { FilterOption } from '@features/filters/models/ui/filter-option.ui';

@Component({
  selector: 'app-filter-group',
  imports: [IonList, IonListHeader, IonItem, IonCheckbox],
  templateUrl: './filter-group.html',
  styleUrl: './filter-group.scss',
})
export class FilterGroup<T extends string | number> {
  readonly heading = input.required<string>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly selected = model.required<readonly T[]>();

  protected toggle(value: T, checked: boolean): void {
    const others = this.selected().filter((selected) => selected !== value);
    this.selected.set(checked ? [...others, value] : others);
  }
}
