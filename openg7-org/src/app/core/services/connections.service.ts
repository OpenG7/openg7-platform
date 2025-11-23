import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../config/environment.tokens';
import { ConnectionDraft, ConnectionResponse } from '../models/connection';

interface StrapiCreateConnectionRequest {
  readonly data: {
    readonly match: number;
    readonly intro_message: string;
    readonly buyer_profile: number;
    readonly supplier_profile: number;
    readonly locale: 'fr' | 'en';
    readonly attachments: readonly string[];
    readonly logistics_plan: {
      readonly incoterm?: string | null;
      readonly transports?: readonly string[];
    };
    readonly meeting_proposal: readonly string[];
  };
}

interface StrapiCreateConnectionResponse {
  readonly data: {
    readonly id: number;
    readonly attributes?: {
      readonly stage?: string | null;
      readonly createdAt?: string | null;
      readonly updatedAt?: string | null;
    };
  };
}

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/services ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Connections ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ConnectionsService gérée par le framework.
 */
export class ConnectionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) ?? '';

  /**
   * Contexte : Called when a buyer initiates a connection request from a match card.
   * Raison d’être : Serialises the draft payload and posts it to Strapi’s connections endpoint.
   * @param draft Connection draft containing intro message, logistics and participants.
   * @returns Observable emitting the raw Strapi response.
   */
  createConnection(draft: ConnectionDraft) {
    const url = this.composeUrl('/api/connections');
    const payload = this.mapDraftToRequest(draft);
    return this.http.post<StrapiCreateConnectionResponse>(url, payload);
  }

  private mapDraftToRequest(draft: ConnectionDraft): StrapiCreateConnectionRequest {
    const transports = draft.logistics.transports?.map((mode) => mode.toUpperCase()) ?? [];
    return {
      data: {
        match: draft.matchId,
        intro_message: draft.introMessage,
        buyer_profile: draft.buyerProfile.id,
        supplier_profile: draft.supplierProfile.id,
        locale: draft.locale,
        attachments: draft.attachments,
        logistics_plan: {
          incoterm: draft.logistics.incoterm ?? null,
          transports,
        },
        meeting_proposal: draft.meetingSlots,
      },
    };
  }

  private composeUrl(path: string): string {
    const base = this.apiUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }
}

/**
 * Contexte : Used by calling code after {@link createConnection} completes to map the response for UI consumption.
 * Raison d’être : Normalises Strapi payloads into the shared {@link ConnectionResponse} interface.
 * @param response Strapi response returned when creating a connection.
 * @returns Connection response shaped for the frontend.
 */
export function mapStrapiConnectionResponse(response: StrapiCreateConnectionResponse): ConnectionResponse {
  const data = response?.data;
  if (!data) {
    throw new Error('Invalid response payload');
  }
  const attrs = data.attributes ?? {};
  return {
    id: data.id,
    stage: mapStage(attrs.stage),
    createdAt: attrs.createdAt ?? new Date().toISOString(),
    updatedAt: attrs.updatedAt ?? undefined,
  };
}

function mapStage(stage?: string | null): ConnectionResponse['stage'] {
  const value = stage?.toLowerCase();
  switch (value) {
    case 'intro':
    case 'reply':
    case 'meeting':
    case 'review':
    case 'deal':
      return value;
    default:
      return 'reply';
  }
}
