"use client";

import React, { useId } from "react";
import {
  kpiPresetIconCssVars,
  type KpiPresetIconSvgProps,
} from "../kpi-preset-icon-shared";

/** KPI 预设矢量：KpiIconPharmacy（内联 SVG，取色见 --asset-icon-*） */
export function KpiIconPharmacy(props: KpiPresetIconSvgProps) {
  const p = useId().replace(/:/g, "");
  const I = (s: string) => `${p}-${s}`;
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      style={{ ...kpiPresetIconCssVars(), ...props.style }}
      aria-hidden
    >
      <g fill="none" className="nc-icon-wrapper">
          <path d="M14.9121 2.03856C15.5868 0.870014 17.0814 0.469452 18.25 1.14403C19.4186 1.81871 19.8191 3.31331 19.1445 4.48192L13.0772 14.9994C12.7201 15.6186 12.0596 16.0001 11.3448 16.0001H8.58796C7.81828 16.0001 7.33714 15.167 7.7218 14.5003L14.9121 2.03856Z" fill={`url(#${I("i0")})`} data-glass="origin" mask={`url(#${I("i5")})`}></path>
          <path d="M14.9121 2.03856C15.5868 0.870014 17.0814 0.469452 18.25 1.14403C19.4186 1.81871 19.8191 3.31331 19.1445 4.48192L13.0772 14.9994C12.7201 15.6186 12.0596 16.0001 11.3448 16.0001H8.58796C7.81828 16.0001 7.33714 15.167 7.7218 14.5003L14.9121 2.03856Z" fill={`url(#${I("i0")})`} data-glass="clone" filter={`url(#${I("i4")})`} clipPath={`url(#${I("i3")})`}></path>
          <path d="M20 9C21.1046 9 22 9.89543 22 11V13C22 16.4343 19.5262 19.2877 16.2637 19.8828L16.1641 20.6865C16.07 21.4369 15.4321 22 14.6758 22H9.29199C8.54954 22 7.9188 21.4569 7.80859 20.7227L7.68066 19.873C4.44568 19.2558 2 16.4148 2 13V11C2 9.89543 2.89543 9 4 9H20Z" fill={`url(#${I("i1")})`} data-glass="blur"></path>
          <path d="M15 19.25V20H9V19.25H15ZM21.25 13V11C21.25 10.3096 20.6904 9.75 20 9.75H4C3.30964 9.75 2.75 10.3096 2.75 11V13C2.75 16.4518 5.54822 19.25 9 19.25V20C5.13401 20 2 16.866 2 13V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V13C22 16.866 18.866 20 15 20V19.25C18.4518 19.25 21.25 16.4518 21.25 13Z" fill={`url(#${I("i2")})`}></path>
          <defs>
            <linearGradient id={I("i0")} x1="13.164" y1=".816" x2="13.164" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-shade-mid)" data-glass-11="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-shade-deep)" data-glass-12="on"></stop>
            </linearGradient>
            <linearGradient id={I("i1")} x1="12" y1="9" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-frost-from)" data-glass-21="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-frost-to)" data-glass-22="on"></stop>
            </linearGradient>
            <linearGradient id={I("i2")} x1="12" y1="9" x2="12" y2="15.37" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-highlight)" data-glass-light="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-highlight)" stopOpacity="0" data-glass-light="on"></stop>
            </linearGradient>
            <filter id={I("i4")} x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="2" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
            </filter>
            <clipPath id={I("i3")}>
              <path d="M20 9C21.1046 9 22 9.89543 22 11V13C22 16.4343 19.5262 19.2877 16.2637 19.8828L16.1641 20.6865C16.07 21.4369 15.4321 22 14.6758 22H9.29199C8.54954 22 7.9188 21.4569 7.80859 20.7227L7.68066 19.873C4.44568 19.2558 2 16.4148 2 13V11C2 9.89543 2.89543 9 4 9H20Z" fill={`url(#${I("i1")})`}></path>
            </clipPath>
            <mask id={I("i5")}>
              <rect width="100%" height="100%" fill="var(--asset-icon-mask-bg)"></rect>
              <path d="M20 9C21.1046 9 22 9.89543 22 11V13C22 16.4343 19.5262 19.2877 16.2637 19.8828L16.1641 20.6865C16.07 21.4369 15.4321 22 14.6758 22H9.29199C8.54954 22 7.9188 21.4569 7.80859 20.7227L7.68066 19.873C4.44568 19.2558 2 16.4148 2 13V11C2 9.89543 2.89543 9 4 9H20Z" fill="var(--asset-icon-mask-cutout)"></path>
            </mask>
          </defs>
        </g>
    </svg>
  );
}
