import fs from 'fs';
import path from 'path';
import { ChannelConnection } from '../../types/index.js';

export class ChannelRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'channel_connections.json');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readAll(): ChannelConnection[] {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[ChannelRepository] Failed to read channel connections', e);
      return [];
    }
  }

  private writeAll(connections: ChannelConnection[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(connections, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ChannelRepository] Failed to write channel connections', e);
    }
  }

  async getAll(): Promise<ChannelConnection[]> {
    return this.readAll();
  }

  async getByWorkspace(workspaceId: string): Promise<ChannelConnection[]> {
    const all = this.readAll();
    return all.filter(c => c.workspaceId === workspaceId);
  }

  async getByProperty(workspaceId: string, propertyId: string): Promise<ChannelConnection[]> {
    const all = this.readAll();
    return all.filter(c => c.workspaceId === workspaceId && c.propertyId === propertyId);
  }

  async getById(id: string): Promise<ChannelConnection | null> {
    const all = this.readAll();
    return all.find(c => c.id === id) || null;
  }

  async save(connection: ChannelConnection): Promise<void> {
    const all = this.readAll();
    const existingIndex = all.findIndex(c => c.id === connection.id);

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...connection,
        updatedAt: new Date().toISOString()
      };
    } else {
      all.push({
        ...connection,
        createdAt: connection.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    this.writeAll(all);
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const all = this.readAll();
    const filtered = all.filter(c => !(c.id === id && c.workspaceId === workspaceId));
    if (filtered.length !== all.length) {
      this.writeAll(filtered);
      return true;
    }
    return false;
  }
}
