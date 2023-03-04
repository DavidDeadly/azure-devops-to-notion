import dotenv from "dotenv";
import { getEnvs } from "./getEnv";

dotenv.config();

export const [
  ID_DESCRIPTION_PROP,
  ID_NAME_PROP,
  ID_TYPE_PROP,
  ID_ACCEPTENCE_CRITERIA_PROP,
  ID_STATUS_PROP,
  ID_STORY_POINTS_PROP,
  ID_ID_PROP,
  ID_URL_PROP
]= getEnvs(
  "ID_DESCRIPTION_PROP",
  "ID_NAME_PROP",
  "ID_TYPE_PROP",
  "ID_ACCEPTENCE_CRITERIA_PROP",
  "ID_STATUS_PROP",
  "ID_STORY_POINTS_PROP",
  "ID_ID_PROP",
  "ID_URL_PROP"
)