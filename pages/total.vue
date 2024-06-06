<template>
	<v-layout row wrap d-flex align-center justify-center class="pa-16">
		<table>

			<tbody v-for="(rank, indexRank) in listRanks" :key="indexRank">
				<tr>
					<th scope="col" colspan="5" class="text-h5 font-weight-bold cell-title">{{ rank?.attributes?.Name }}</th>
				</tr>
				<tr v-for="(Member, indexMember) in award.filter(val => val?.attributes?.Rank === rank?.attributes?.Rank)"
					:key="indexMember" class="text-h5">
					<td>{{ indexMember + 1 }}</td>
					<td>{{ Member.attributes.Number.toString().padStart(4,"0") }}</td>
					<td>{{ Member.attributes.Name }}</td>
					<td>{{ Member.attributes.Phone }}</td>
					<td>{{ Member.attributes.Address }}</td>
				</tr>
			</tbody>
		</table>
	</v-layout>
</template>

<script>
import axiosClient from "~/api/clientAPI";
export default {
	data() {
		return {
			listRanks: [],
			award: []
		}
	},
	async mounted() {
		this.listRanks = (await axiosClient.get("/list-ranks")).data.data
		this.award = (await axiosClient.get("/awards")).data.data

		setInterval(() => {
			this.fetchData();
		}, 1000);
	},
	methods: {
		async fetchData() {
			let listAward = []
			this.listRanks = (await axiosClient.get("/list-ranks")).data.data
			let index = 1;
			let pagination

			do {
				const award = (await axiosClient.get(`/awards?pagination[page]=${index}`))
				const dataAward = award.data.data
				pagination = award.data.meta.pagination
				index++;

				listAward.push(...dataAward)
			} while (pagination.page !== pagination.pageCount)

			this.award = [...listAward]
		}
	}
}
</script>

<style>
table {
	border-collapse: collapse;
	border: 2px solid rgb(140 140 140);
	font-family: sans-serif;
	font-size: 0.8rem;
	letter-spacing: 1px;
	background-color: #F9FBE7;
}

.cell-title {
	background-color: #ECCDB4;
}

thead,
tfoot {
	background-color: rgb(228 240 245);
}


th,
td {
	border: 1px solid rgb(160 160 160);
	padding: 8px 20px;
}

td:last-of-type {
	text-align: center;
}

tbody>tr:nth-of-type(even) {
	background-color: #F0EDD4;
}
</style>