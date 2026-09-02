"use client";

import { Bin } from "./Bin";
import { FreeResourcesPanel } from "./FreeResources";
import { BlogsPanel } from "./RecentBlogs";
import { SocialLinksPanel } from "./SocialLinksPanel";

/**
 * The portal's "shelf": three uniform bins ordered by conversion intent.
 * Free Resources opens by default until the product waitlist takes the
 * eye-level slot.
 */
export function PortalBins() {
  return (
    <div className="w-full flex flex-col gap-2.5">
      <Bin label="Free Resources" defaultOpen bare index={0}>
        <FreeResourcesPanel />
      </Bin>
      <Bin label="Our Blogs" index={1}>
        <BlogsPanel />
      </Bin>
      <Bin label="Social Links" index={2}>
        <SocialLinksPanel />
      </Bin>
    </div>
  );
}
