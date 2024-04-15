import { Component } from '@angular/core';
import { DataMappingComponent } from '../public-api';
export const dataMappingComponent = [DataMappingComponent];
@Component({
  selector: 'data-mapping-lib',
  standalone: true,
  imports: [DataMappingComponent],
  template: `
    <p>
      data-mapping-lib works!
    </p>
  `,
  styles: ``
})
export class DataMappingLibComponent {
}

