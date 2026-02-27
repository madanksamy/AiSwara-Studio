import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client for server operations
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * GET /api/presets
 * List all presets (system + user)
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      // Return empty if Supabase not configured
      return NextResponse.json({ presets: [] });
    }

    const { data: presets, error } = await supabase
      .from('presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ presets: presets || [] });
  } catch (error) {
    console.error('Failed to fetch presets:', error);
    return NextResponse.json({ presets: [] });
  }
}

/**
 * POST /api/presets
 * Create a new user preset
 */
export async function POST(request: NextRequest) {
  try {
    const { name, config, category = 'user', tags = [] } = await request.json();

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Name and config are required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      // Return mock preset if Supabase not configured
      const mockPreset = {
        id: `user-${Date.now()}`,
        name,
        category,
        tags,
        config,
        isSystem: false,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ preset: mockPreset });
    }

    const { data: preset, error } = await supabase
      .from('presets')
      .insert({
        name,
        category,
        tags,
        config,
        is_system: false,
        // user_id would come from auth in production
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Failed to create preset:', error);
    return NextResponse.json(
      { error: 'Failed to create preset' },
      { status: 500 }
    );
  }
}
