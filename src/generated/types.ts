// Barrel file: re-exports and defines all types needed by the codebase.
// Types from the old hand-written types.ts that are not yet covered by
// the new generated clients live here until the API specs are updated.

// Re-export types that exist in the new generated files
// (Note: the generated shapes differ from the legacy ones used throughout
// the codebase, so we keep the legacy definitions below instead of
// re-exporting. When the codebase is migrated to the new generated
// clients these can be removed.)

// === ENUMS ===

export enum Visibility {
	User = 'user',
	Organization = 'organization',
	Public = 'public',
}

export enum Publication {
	MembershipRequestsCreate = 'membership_requests.create',
	MembershipsCreate = 'memberships.create',
	ApplicationsCreate = 'applications.create',
	VersionsCreate = 'versions.create',
	VersionsMaterialChange = 'versions.material_change',
}

export enum OriginalType {
	ApiJson = 'api_json',
	AvroIdl = 'avro_idl',
	ServiceJson = 'service_json',
	Swagger = 'swagger',
}

export enum AppSortBy {
	Name = 'name',
	CreatedAt = 'created_at',
	UpdatedAt = 'updated_at',
	Visibility = 'visibility',
}

export enum SortOrder {
	Asc = 'asc',
	Desc = 'desc',
}

export enum MembershipRole {
	Member = 'member',
	Admin = 'admin',
}

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

export enum FileFlag {
	Scaffolding = 'scaffolding',
}

// === COMMON MODELS ===

export interface ReferenceGuid {
	guid: string;
}

export interface Reference {
	guid: string;
	key: string;
}

export interface Audit {
	created_at: string;
	created_by: ReferenceGuid;
	updated_at: string;
	updated_by: ReferenceGuid;
}

// === API MODELS ===

export interface User {
	guid: string;
	email: string;
	nickname: string;
	name?: string;
	audit: Audit;
}

export interface UserSummary {
	guid: string;
	nickname: string;
}

export interface ApiSession {
	id: string;
	expires_at: string;
}

export interface Authentication {
	user: User;
	session: ApiSession;
}

export interface Domain {
	name: string;
}

export interface Organization {
	guid: string;
	key: string;
	name: string;
	namespace: string;
	visibility: Visibility;
	domains: Domain[];
	audit: Audit;
}

export interface OrganizationForm {
	name: string;
	key?: string;
	namespace: string;
	visibility?: Visibility;
	domains?: string[];
}

export interface Application {
	guid: string;
	organization: Reference;
	name: string;
	key: string;
	visibility: Visibility;
	description?: string;
	last_updated_at: string;
	audit: Audit;
}

export interface ApplicationForm {
	name: string;
	key?: string;
	description?: string;
	visibility: Visibility;
}

export interface ApplicationSummary {
	guid: string;
	organization: Reference;
	key: string;
}

export interface ApplicationMetadataVersion {
	version: string;
}

export interface Original {
	type: OriginalType;
	data: string;
}

export interface OriginalForm {
	type?: OriginalType;
	data: string;
}

export interface Version {
	guid: string;
	organization: Reference;
	application: Reference;
	version: string;
	original?: Original;
	service: Service;
	audit: Audit;
}

export interface VersionForm {
	original_form: OriginalForm;
	visibility?: Visibility;
}

export interface Membership {
	guid: string;
	user: User;
	organization: Organization;
	role: MembershipRole;
	audit: Audit;
}

export interface MembershipRequest {
	guid: string;
	user: User;
	organization: Organization;
	role: MembershipRole;
	audit: Audit;
}

export interface Token {
	guid: string;
	user: User;
	masked_token: string;
	description?: string;
	audit: Audit;
}

export interface CleartextToken {
	token: string;
}

export interface TokenForm {
	user_guid: string;
	description?: string;
}

export interface Subscription {
	guid: string;
	organization: Organization;
	user: User;
	publication: Publication;
	audit: Audit;
}

export interface SubscriptionForm {
	organization_key: string;
	user_guid: string;
	publication: Publication;
}

export interface Watch {
	guid: string;
	user: User;
	organization: Organization;
	application: Application;
	audit: Audit;
}

export interface WatchForm {
	user_guid: string;
	organization_key: string;
	application_key: string;
}

export interface AttributeSummary {
	guid: string;
	name: string;
}

export interface AttributeValue {
	guid: string;
	attribute: AttributeSummary;
	value: string;
	audit: Audit;
}

export interface AttributeValueForm {
	value: string;
}

export interface ApiAttribute {
	guid: string;
	name: string;
	description?: string;
	audit: Audit;
}

export interface AttributeForm {
	name: string;
	description?: string;
}

export interface Validation {
	valid: boolean;
	errors: string[];
}

export interface ApiError {
	code: string;
	message: string;
}

export interface GeneratorService {
	guid: string;
	uri: string;
	audit: Audit;
}

export interface GeneratorServiceForm {
	uri: string;
}

export interface Generator {
	key: string;
	name: string;
	language?: string;
	description?: string;
	attributes: string[];
}

export interface GeneratorWithService {
	service: GeneratorService;
	generator: Generator;
}

export interface GeneratorFile {
	name: string;
	dir?: string;
	contents: string;
	flags?: FileFlag[];
}

export interface Code {
	generator: GeneratorWithService;
	source?: string;
	files: GeneratorFile[];
}

export interface CodeForm {
	attributes: GeneratorAttribute[];
}

export interface GeneratorAttribute {
	name: string;
	value: string;
}

export interface MoveForm {
	org_key: string;
}

export interface PasswordResetRequest {
	email: string;
}

export interface PasswordReset {
	token: string;
	password: string;
}

export interface EmailVerificationConfirmationForm {
	token: string;
}

// Change/diff types
export interface ChangeVersion {
	guid: string;
	version: string;
}

export interface DiffBreaking {
	type: 'diff_breaking';
	description: string;
	is_material: boolean;
}

export interface DiffNonBreaking {
	type: 'diff_non_breaking';
	description: string;
	is_material: boolean;
}

export type Diff = DiffBreaking | DiffNonBreaking;

export interface Change {
	guid: string;
	organization: Reference;
	application: Reference;
	from_version: ChangeVersion;
	to_version: ChangeVersion;
	diff: Diff;
	changed_at: string;
	changed_by: UserSummary;
	audit: Audit;
}

export interface ItemDetailApplicationSummary {
	type: 'application_summary';
	guid: string;
	organization: Reference;
	key: string;
}

export type ItemDetail = ItemDetailApplicationSummary;

export interface Item {
	guid: string;
	detail: ItemDetail;
	label: string;
	description?: string;
}

// === SPEC MODELS (apibuilder-spec.json) ===

export interface SpecOrganization {
	key: string;
}

export interface SpecApplication {
	key: string;
}

export interface Info {
	license?: License;
	contact?: Contact;
}

export interface License {
	name: string;
	url?: string;
}

export interface Contact {
	name?: string;
	url?: string;
	email?: string;
}

export interface Annotation {
	name: string;
	description?: string;
}

export interface EnumValue {
	name: string;
	description?: string;
	attributes: Record<string, unknown>;
	value?: string;
}

export interface SpecEnum {
	name: string;
	plural: string;
	description?: string;
	values: EnumValue[];
	attributes: Record<string, unknown>;
}

export interface Field {
	name: string;
	type: string;
	description?: string;
	default?: string;
	required: boolean;
	minimum?: number;
	maximum?: number;
	example?: string;
	attributes: Record<string, unknown>;
	annotations?: string[];
}

export interface SpecInterface {
	name: string;
	plural: string;
	description?: string;
	fields: Field[];
	attributes: Record<string, unknown>;
}

export interface UnionType {
	type: string;
	description?: string;
	attributes: Record<string, unknown>;
	default?: boolean;
	discriminator_value?: string;
}

export interface SpecUnion {
	name: string;
	plural: string;
	discriminator: string;
	description?: string;
	types: UnionType[];
	attributes: Record<string, unknown>;
	interfaces?: string[];
}

export interface Model {
	name: string;
	plural: string;
	description?: string;
	fields: Field[];
	attributes: Record<string, unknown>;
	interfaces?: string[];
}

export interface Body {
	type: string;
	description?: string;
	attributes: Record<string, unknown>;
}

export interface Parameter {
	name: string;
	type: string;
	location: ParameterLocation;
	description?: string;
	required: boolean;
	default?: string;
	minimum?: number;
	maximum?: number;
	example?: string;
	attributes?: Record<string, unknown>;
}

export interface ResponseCode {
	integer?: { value: number };
	response_code_option?: { value: string };
}

export interface Response {
	code: ResponseCode;
	type: string;
	headers?: Header[];
	description?: string;
	attributes?: Record<string, unknown>;
}

export interface Header {
	name: string;
	type: string;
	description?: string;
	required: boolean;
	default?: string;
	attributes: Record<string, unknown>;
}

export interface Operation {
	method: Method;
	path: string;
	description?: string;
	body?: Body;
	parameters: Parameter[];
	responses: Response[];
	attributes: Record<string, unknown>;
}

export interface Resource {
	type: string;
	plural: string;
	path?: string;
	description?: string;
	operations: Operation[];
	attributes: Record<string, unknown>;
}

export interface Import {
	uri: string;
	namespace: string;
	organization: SpecOrganization;
	application: SpecApplication;
	version: string;
	enums: string[];
	interfaces?: string[];
	unions: string[];
	models: string[];
	annotations?: Annotation[];
}

export interface Service {
	name: string;
	organization: SpecOrganization;
	application: SpecApplication;
	namespace: string;
	version: string;
	base_url?: string;
	description?: string;
	info: Info;
	headers: Header[];
	imports: Import[];
	enums: SpecEnum[];
	interfaces?: SpecInterface[];
	unions: SpecUnion[];
	models: Model[];
	resources: Resource[];
	attributes: Record<string, unknown>;
	annotations?: Annotation[];
}
