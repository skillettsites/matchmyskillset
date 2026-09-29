/**
 * Building blocks for the profession-exit hubs (teaching, nursing, police,
 * armed forces, retail) and the /careers-for index. Server components only:
 * they read the ONS dataset in `@/data/careers`.
 */
export * from "./routes";
export * from "./format";
export { HubRouteCards, RouteWayIn, RoutePaySource, inSentence, type HubRouteCardsProps } from "./HubRouteCards";
export { HubPayTable, type HubPayTableProps, type PayComparator } from "./HubPayTable";
export {
  FactList,
  FundedTraining,
  HubPage,
  HubSection,
  MethodNote,
  OnThisPage,
  RelatedLinks,
  SourcesList,
  type Fact,
  type FundedTrainingProps,
  type RelatedLink,
  type SourceItem,
} from "./HubBlocks";
export { ArticleJsonLd } from "./ArticleJsonLd";
export { AudienceCards, ApprenticeshipTable, LiveJobLinks, OtherCareers, PayRangeTable, type AudienceCard } from "./NicheBlocks";
