import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read from the config directory at the project root
    const configPath = path.join(process.cwd(), '..', '..', 'config', 'instruments.json');
    const fileContent = await fs.readFile(configPath, 'utf-8');
    const instrumentsData = JSON.parse(fileContent);

    return NextResponse.json(instrumentsData);
  } catch (error) {
    console.error('Failed to load instruments:', error);

    // Return a default set of instruments if file can't be loaded
    const defaultInstruments = {
      instruments: [
        { id: 'veena', name: 'Veena', category: 'melodic', styles: ['carnatic', 'saraswati', 'rudra'] },
        { id: 'violin', name: 'Violin', category: 'melodic', styles: ['classical', 'film', 'western'] },
        { id: 'flute', name: 'Flute', category: 'melodic', styles: ['bansuri', 'carnatic', 'western'] },
        { id: 'sitar', name: 'Sitar', category: 'melodic', styles: ['hindustani', 'fusion'] },
        { id: 'nadaswaram', name: 'Nadaswaram', category: 'melodic', styles: ['temple', 'wedding', 'classical'] },
        { id: 'mridangam', name: 'Mridangam', category: 'percussion', styles: ['classical', 'fusion'] },
        { id: 'tabla', name: 'Tabla', category: 'percussion', styles: ['classical', 'film', 'fusion'] },
        { id: 'ghatam', name: 'Ghatam', category: 'percussion', styles: ['classical', 'traditional'] },
        { id: 'thavil', name: 'Thavil', category: 'percussion', styles: ['temple', 'folk', 'traditional'] },
        { id: 'parai', name: 'Parai', category: 'percussion', styles: ['folk', 'festival', 'street'] },
        { id: 'acoustic-guitar', name: 'Acoustic Guitar', category: 'guitar', styles: ['fingerstyle', 'strumming', 'classical'] },
        { id: 'electric-guitar', name: 'Electric Guitar', category: 'guitar', styles: ['clean', 'crunch', 'lead', 'rhythm'] },
        { id: 'bass-guitar', name: 'Bass Guitar', category: 'bass', styles: ['fingerstyle', 'slap', 'picked'] },
        { id: 'synth-bass', name: 'Synth Bass', category: 'bass', styles: ['analog', 'modern', '808'] },
        { id: 'strings', name: 'String Section', category: 'texture', styles: ['lush', 'cinematic', 'minimal'] },
        { id: 'synth-pad', name: 'Synth Pad', category: 'texture', styles: ['warm', 'ambient', 'evolving'] },
        { id: 'tanpura', name: 'Tanpura', category: 'texture', styles: ['drone', 'classical'] },
      ],
    };

    return NextResponse.json(defaultInstruments);
  }
}
