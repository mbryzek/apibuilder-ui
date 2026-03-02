/**
 * TypeScript types for apibuilder spec
 * Based on API Builder specification at io.apibuilder.spec.v0
 *
 * NOTE: Manually maintained because the TypeScript generator cannot handle
 * the response_code union type (missing discriminator). If the generator
 * is fixed, replace this file by adding apibuilder-spec to .apibuilder/config.
 */

// ============================================================================
// Enums
// ============================================================================

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}

export enum ParameterLocation {
  Path = 'Path',
  Query = 'Query',
  Form = 'Form',
  Header = 'Header',
}

export enum ResponseCodeOption {
  Default = 'Default',
}

// ============================================================================
// Models
// ============================================================================

export interface Apidoc {
  version: string;
}

export interface Application {
  key: string;
}

export interface Annotation {
  name: string;
  description?: string;
  deprecation?: Deprecation;
}

export interface Attribute {
  name: string;
  value: Record<string, unknown>;
  description?: string;
  deprecation?: Deprecation;
}

export interface Body {
  type: string;
  description?: string;
  deprecation?: Deprecation;
  attributes: Attribute[];
}

export interface Contact {
  name?: string;
  url?: string;
  email?: string;
}

export interface Deprecation {
  description?: string;
}

export interface Enum {
  name: string;
  plural: string;
  description?: string;
  deprecation?: Deprecation;
  values: EnumValue[];
  attributes: Attribute[];
}

export interface EnumValue {
  name: string;
  description?: string;
  deprecation?: Deprecation;
  attributes: Attribute[];
  value?: string;
}

export interface Field {
  name: string;
  type: string;
  description?: string;
  deprecation?: Deprecation;
  default?: string;
  required: boolean;
  minimum?: number;
  maximum?: number;
  example?: string;
  attributes: Attribute[];
  annotations?: string[];
}

export interface Header {
  name: string;
  type: string;
  description?: string;
  deprecation?: Deprecation;
  required: boolean;
  default?: string;
  attributes: Attribute[];
}

export interface Import {
  uri: string;
  namespace: string;
  organization: Organization;
  application: Application;
  version: string;
  enums: string[];
  interfaces?: string[];
  unions: string[];
  models: string[];
  annotations?: Annotation[];
}

export interface Info {
  license?: License;
  contact?: Contact;
}

export interface Interface {
  name: string;
  plural: string;
  description?: string;
  deprecation?: Deprecation;
  fields: Field[];
  attributes: Attribute[];
}

export interface License {
  name: string;
  url?: string;
}

export interface Model {
  name: string;
  plural: string;
  description?: string;
  deprecation?: Deprecation;
  fields: Field[];
  attributes: Attribute[];
  interfaces?: string[];
}

export interface Operation {
  method: Method;
  path: string;
  description?: string;
  deprecation?: Deprecation;
  body?: Body;
  parameters: Parameter[];
  responses: Response[];
  attributes: Attribute[];
}

export interface Organization {
  key: string;
}

export interface Parameter {
  name: string;
  type: string;
  location: ParameterLocation;
  description?: string;
  deprecation?: Deprecation;
  required: boolean;
  default?: string;
  minimum?: number;
  maximum?: number;
  example?: string;
  attributes?: Attribute[];
}

export interface Resource {
  type: string;
  plural: string;
  path?: string;
  description?: string;
  deprecation?: Deprecation;
  operations: Operation[];
  attributes: Attribute[];
}

export interface Response {
  code: ResponseCode;
  type: string;
  headers?: Header[];
  description?: string;
  deprecation?: Deprecation;
  attributes?: Attribute[];
}

export interface ResponseCodeInt {
  value: number;
}

export interface ResponseCodeOption_ {
  value: string;
}

export interface ResponseCode {
  integer?: ResponseCodeInt;
  response_code_option?: ResponseCodeOption_;
}

/**
 * Describes the API service.
 */
export interface Service {
  apidoc?: Apidoc;
  name: string;
  organization: Organization;
  application: Application;
  namespace: string;
  version: string;
  base_url?: string;
  description?: string;
  info: Info;
  headers: Header[];
  imports: Import[];
  enums: Enum[];
  interfaces?: Interface[];
  unions: Union[];
  models: Model[];
  resources: Resource[];
  attributes: Attribute[];
  annotations?: Annotation[];
}

export interface Union {
  name: string;
  plural: string;
  discriminator?: string;
  description?: string;
  deprecation?: Deprecation;
  types: UnionType[];
  attributes: Attribute[];
  interfaces?: string[];
}

export interface UnionType {
  type: string;
  description?: string;
  deprecation?: Deprecation;
  attributes: Attribute[];
  default?: boolean;
  discriminator_value?: string;
}
