import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assetUrl',
  standalone: true,
})
export class AssetUrlPipe implements PipeTransform {
  transform(value: string): string {
    return `https://financialmodelingprep.com/image-stock/${value}.png`;
  }
}
