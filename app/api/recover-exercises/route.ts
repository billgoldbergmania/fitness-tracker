import { recoverExercises } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function POST() {
    const result = await recoverExercises();
    return NextResponse.json(result);
}
