<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization, Membership } from '$generated/com-bryzek-bryzek-apibuilder-v0';
	import { MembershipRole } from '$generated/com-bryzek-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			org: Organization;
			isAdmin: boolean;
			memberships: Membership[];
			pendingRequestsCount: number;
		};
		form: { errors?: ApiErrorItem[]; success?: boolean } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	const memberships = $derived(data.memberships);
	let isSubmitting = $state(false);
	let confirmRemoveId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Members - {org.name} - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<h1 class="text-2xl font-bold text-ab-dark-blue">Members</h1>
		{#if data.isAdmin && data.pendingRequestsCount > 0}
			<a href="/{org.key}/membership-requests" class="btn-secondary mt-3 sm:mt-0 inline-block text-center">
				Pending Requests ({data.pendingRequestsCount})
			</a>
		{/if}
	</div>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.isAdmin}
		<div class="card mb-6">
			<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Add Member</h2>
			<form method="POST" action="?/addMember" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }} class="flex flex-col sm:flex-row gap-3">
				<input type="text" name="email_or_nickname" placeholder="Email or nickname" required class="input-field flex-1 px-3 py-2 border rounded-lg" />
				<select name="role" class="input-field px-3 py-2 border rounded-lg">
					<option value="member">Member</option>
					<option value="admin">Admin</option>
				</select>
				<button type="submit" class="btn-primary" disabled={isSubmitting}>
					{isSubmitting ? 'Adding...' : 'Add'}
				</button>
			</form>
		</div>
	{/if}

	{#if memberships.length === 0}
		<p class="text-ab-gray">No members found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">User</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray">Role</th>
						{#if data.isAdmin}
							<th class="pb-3 text-sm font-semibold text-ab-gray text-right">Actions</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each memberships as membership (membership.id)}
						<tr class="border-b border-gray-100">
							<td class="py-3">
								<div class="font-medium text-ab-dark-blue">{membership.user.nickname}</div>
								<div class="text-sm text-ab-gray">{membership.user.email}</div>
								{#if membership.user.name}
									<div class="text-sm text-ab-gray">{membership.user.name}</div>
								{/if}
							</td>
							<td class="py-3">
								<span class="inline-block text-xs font-medium px-2 py-0.5 rounded-full {membership.role === MembershipRole.Admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
									{membership.role}
								</span>
							</td>
							{#if data.isAdmin}
								<td class="py-3 text-right">
									<div class="flex gap-2 justify-end">
										{#if membership.role === MembershipRole.Admin}
											<form method="POST" action="?/revokeAdmin" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
												<input type="hidden" name="user_guid" value={membership.user.id} />
												<button type="submit" class="text-sm text-ab-blue hover:text-ab-dark-blue" disabled={isSubmitting}>
													Revoke Admin
												</button>
											</form>
										{:else}
											<form method="POST" action="?/makeAdmin" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
												<input type="hidden" name="user_guid" value={membership.user.id} />
												<button type="submit" class="text-sm text-ab-blue hover:text-ab-dark-blue" disabled={isSubmitting}>
													Make Admin
												</button>
											</form>
										{/if}

										{#if confirmRemoveId === membership.id}
											<form method="POST" action="?/removeMember" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; confirmRemoveId = null; await update(); }; }}>
												<input type="hidden" name="guid" value={membership.id} />
												<button type="submit" class="text-sm text-red-600 hover:text-red-800 font-semibold" disabled={isSubmitting}>
													Confirm Remove
												</button>
											</form>
											<button type="button" class="text-sm text-ab-gray hover:text-ab-dark-blue" onclick={() => confirmRemoveId = null}>
												Cancel
											</button>
										{:else}
											<button type="button" class="text-sm text-red-600 hover:text-red-800" onclick={() => confirmRemoveId = membership.id}>
												Remove
											</button>
										{/if}
									</div>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
