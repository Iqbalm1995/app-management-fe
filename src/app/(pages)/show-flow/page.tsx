"use client";

import { Suspense } from "react";
import KnowledgeBaseViewV2 from "./knowledgeBaseView-v2";

export default function KnowledgeBasePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KnowledgeBaseViewV2 />
        </Suspense>
    );
}
