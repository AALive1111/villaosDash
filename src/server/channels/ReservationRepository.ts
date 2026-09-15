import fs from 'fs';
import path from 'path';
import { Reservation } from '../../types/index.js';
import { mockReservations } from '../../data/mockData.js';

export class ReservationRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'reservations.json');
    this.ensureDirectory();
    this.seedIfEmpty();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private seedIfEmpty() {
    if (!fs.existsSync(this.filePath)) {
      this.writeAll(mockReservations);
    }
  }

  private readAll(): Reservation[] {
    if (!fs.existsSync(this.filePath)) {
      return [...mockReservations];
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...mockReservations];
    } catch (e) {
      console.error('[ReservationRepository] Failed to read reservations', e);
      return [...mockReservations];
    }
  }

  private writeAll(reservations: Reservation[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(reservations, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ReservationRepository] Failed to write reservations', e);
    }
  }

  async getAll(): Promise<Reservation[]> {
    return this.readAll();
  }

  async getByWorkspace(workspaceId: string): Promise<Reservation[]> {
    const all = this.readAll();
    return all.filter(r => r.workspaceId === workspaceId);
  }

  async getByProperty(workspaceId: string, propertyId: string): Promise<Reservation[]> {
    const all = this.readAll();
    return all.filter(r => r.workspaceId === workspaceId && r.propertyId === propertyId);
  }

  async saveBatch(reservationsToMerge: Reservation[]): Promise<void> {
    const all = this.readAll();
    const map = new Map<string, Reservation>();

    // Index all existing
    for (const res of all) {
      map.set(res.id, res);
    }

    // Upsert batch
    for (const res of reservationsToMerge) {
      map.set(res.id, res);
    }

    this.writeAll(Array.from(map.values()));
  }

  async replaceForWorkspace(workspaceId: string, updatedReservations: Reservation[]): Promise<void> {
    const all = this.readAll();
    // Keep reservations from other workspaces
    const otherReservations = all.filter(r => r.workspaceId !== workspaceId);
    this.writeAll([...otherReservations, ...updatedReservations]);
  }
}
