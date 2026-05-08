export type SvgMarkupBuilderArgs = {
  idPrefix: string;
  color: (cssVarName: string, fallback: string) => string;
};
