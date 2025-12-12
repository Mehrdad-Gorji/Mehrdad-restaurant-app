import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const apikey = searchParams.get('apikey');

    console.log("🖨️ Printer Request:", { action, apikey });

    // Verify API Key (simple check vs hardcoded value in settings.ini which is 123456)
    if (apikey !== '123456') {
        return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    if (action === 'erfan_autoprinter_get_order') {
        // MOCK RESPONSE TO TEST PRINTER
        // We guess the format: A list of orders with 'content' to print.
        const mockResponse = [
            {
                id: 999999,
                title: "Test Order #999",
                content: `
                    <div style="width: 300px; font-family: monospace;">
                        <h2 style="text-align: center;">Web Fahim Test</h2>
                        <hr/>
                        <p>If you read this,</p>
                        <p>CONNECTION IS SUCCESSFUL!</p>
                        <hr/>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>
                `
            }
        ];

        return NextResponse.json(mockResponse);
    }

    if (action === 'erfan_autoprinter_update_order') {
        const id = searchParams.get('id');
        console.log("✅ Printer marked order as done:", id);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Printer API Ready' });
}
