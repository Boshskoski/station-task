import { Component, computed, inject, input, output } from '@angular/core';
import { IonBadge, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDown } from 'ionicons/icons';
import { ViewportService } from '@shared/services/viewport.service';

@Component({
  selector: 'app-toolbar-panel-button',
  imports: [IonButton, IonIcon, IonBadge],
  templateUrl: './toolbar-panel-button.html',
  styleUrl: './toolbar-panel-button.scss',
})
export class ToolbarPanelButton {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly triggerId = input.required<string>();
  readonly count = input(0);
  readonly countLabel = input.required<string>();
  readonly badgeColor = input.required<string>();
  readonly expanded = input(false);
  readonly pressed = output<void>();

  protected readonly viewport = inject(ViewportService);

  protected readonly ariaLabel = computed(() =>
    this.count() === 0 ? this.label() : `${this.label()}, ${this.count()} ${this.countLabel()}`,
  );

  constructor() {
    addIcons({ chevronDown });
  }
}
