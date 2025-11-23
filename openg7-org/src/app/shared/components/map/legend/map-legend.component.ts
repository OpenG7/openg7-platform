import { Component } from '@angular/core';

@Component({
  selector: 'og7-map-legend',
  standalone: true,
  templateUrl: './map-legend.component.html',
  host: { style: 'display:block;width:1px;height:1px;' },
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/map/legend » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Map Legend ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns MapLegendComponent gérée par le framework.
 */
export class MapLegendComponent {}
