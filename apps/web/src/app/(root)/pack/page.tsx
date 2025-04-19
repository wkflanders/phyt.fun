import React from 'react';

import { Packs } from '@/components/packs/Packs';
import { SynthwaveBackground } from '@/components/packs/SynthwaveBackground';

export default function PackPage() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-transparent">
            {/* Our 3D synthwave background */}
            <SynthwaveBackground />

            {/* Existing Packs component or page content */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-6 py-8">
                <Packs />
            </div>
        </div>
    );
}
