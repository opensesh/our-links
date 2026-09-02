"use client";

import { Bin } from "./Bin";
import { FreeResourcesPanel } from "./FreeResources";
import { DesignPhilosophyPanel } from "./DesignPhilosophyPanel";
import { BlogsPanel } from "./RecentBlogs";
import { SocialLinksPanel } from "./SocialLinksPanel";

/**
 * The portal's "shelf": four uniform bins ordered by conversion intent.
 * Free Resources is the primary bin (aperol, open by default) until the
 * product waitlist takes the eye-level slot.
 */
export function PortalBins() {
  return (
    <div className="w-full flex flex-col gap-2.5">
      <Bin label="Free Resources" variant="primary" defaultOpen bare index={0}>
        <FreeResourcesPanel />
      </Bin>
      <Bin label="Design Philosophy" index={1}>
        <DesignPhilosophyPanel />
      </Bin>
      <Bin label="Our Blogs" index={2}>
        <BlogsPanel />
      </Bin>
      <Bin label="Social Links" index={3}>
        <SocialLinksPanel />
      </Bin>
    </div>
  );
}
