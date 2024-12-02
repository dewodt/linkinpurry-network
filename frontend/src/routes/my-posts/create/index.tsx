import { createFileRoute } from "@tanstack/react-router";

// @ts-expect-error - babel resolver
import * as React from "react";

export const Route = createFileRoute("/my-posts/create/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
        </>
    )
}