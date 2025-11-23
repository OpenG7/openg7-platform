import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImportationSupplierSectionViewModel } from '../../models/importation.models';

@Component({
  standalone: true,
  selector: 'og7-importation-supplier-intel',
  imports: [CommonModule, TranslateModule],
  templateUrl: './importation-supplier-intel.component.html',
  styleUrls: ['./importation-supplier-intel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affiche les cartes d’intelligence fournisseurs.
 * Raison d’être : Met en avant les fournisseurs stratégiques et leurs indicateurs de dépendance.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ImportationSupplierIntelComponent géré par le framework.
 */
export class ImportationSupplierIntelComponent {
  @Input({ required: true }) viewModel!: ImportationSupplierSectionViewModel;

  trackSupplier = (_: number, supplier: { id: string }) => supplier.id;
}
