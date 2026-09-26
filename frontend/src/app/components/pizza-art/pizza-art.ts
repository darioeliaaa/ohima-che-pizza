import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { drawPizza } from '../../utils/pizza-drawing';

/**
 * La pizza disegnata dai suoi ingredienti.
 * Le classi pz-* restano globali: la storia in home le anima livello per livello.
 */
@Component({
  selector: 'app-pizza-art',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="pz" viewBox="-4 -4 208 208" aria-hidden="true" [style.--n]="drawing().count">
      <circle class="pz-crust" cx="100" cy="100" r="95" [attr.fill]="drawing().crust" stroke="#1a1412" stroke-width="3.2"/>
      <circle class="pz-crust-raw" cx="100" cy="100" r="95" fill="#f1dfbb" stroke="#1a1412" stroke-width="3.2"/>
      <g class="pz-char">
        @for (d of drawing().char; track $index) {
          <path [attr.d]="d" fill="#6b3a1e" opacity="0.75"/>
        }
      </g>
      <circle class="pz-dough" cx="100" cy="100" r="82" fill="#f3e1bd"/>
      <path class="pz-base" [attr.d]="drawing().base" [attr.fill]="drawing().baseFill"
            [attr.stroke]="drawing().baseStroke" [attr.stroke-width]="variant() === 'logo' ? 3 : 2"/>
      @for (p of drawing().pieces; track p.i) {
        <g [attr.class]="'pz-p pz-' + p.layer" [style.--i]="p.i">
          @for (s of p.parts; track $index) {
            <path [attr.d]="s.d" [attr.fill]="s.fill" [attr.stroke]="s.stroke ?? null"
                  [attr.stroke-width]="s.sw ?? null" [attr.transform]="s.t ?? null"
                  stroke-linecap="round" stroke-linejoin="round"/>
          }
        </g>
      }
    </svg>
  `,
  styles: [`
    app-pizza-art { display: block; }
    .pz { display: block; width: 100%; height: auto; overflow: visible; }
    .pz-crust-raw { opacity: 0; }
    .pz-p { transform-box: fill-box; transform-origin: 50% 50%; }
  `]
})
export class PizzaArtComponent {
  desc = input('');
  seed = input(1);
  variant = input<'menu' | 'logo'>('menu');

  drawing = computed(() => drawPizza(this.desc(), this.seed(), this.variant()));
}
