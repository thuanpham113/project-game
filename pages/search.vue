<template>
	<v-layout column style="width: 100vw" d-flex align-center>
		<v-container style="max-width: 1050px">
			<v-card class="ma-16 mb-2">
				<v-text-field
					name="phone"
					label="Tìm kiếm bằng số điện thoại"
					id="phone"
					solo
					hide-details
					@change="searchNumber"
					v-model="number"
					append-icon="mdi-magnify"
				></v-text-field>
			</v-card>
			<v-card v-if="dataRepost.length" class="ma-16 mb-2 pa-4 d-flex font-weight-bold" outlined color="#FFD0D0" rounded="lg" style="border: 2px solid;">
				<div style="width: 30%;" class="text-center">
					Tên
				</div>
				<div style="width: 30%;" class="text-center">
					Số Tiền
				</div>
				<div style="width: 40%;" class="text-center">
					Số đã mua
				</div>
			</v-card>

			<v-card class="mx-16 my-2 pa-4 d-flex" v-for="(item, index) in dataRepost" :key="`card-${index}`" id="listCard" elevation="24" rounded="lg">
				<div style="width: 30%;" class="text-center">
					{{ item.Name }}
				</div>
				<div style="width: 30%;" class="text-center">
					{{ item.Money }}
				</div>
				<div style="width: 40%;" class="text-center">
					{{ item.Number }}
				</div>
			</v-card>
		</v-container>
	</v-layout>

</template>

<script>
import axiosClient from "../api/clientAPI";
export default {
	data()  {
		return {
			number: "",
			dataRepost: []
		}
	},
	mounted() {
		// listen for the event key esc
		window.addEventListener('keyup', (e)=>{
			if(e.key === 'Escape') {
				this.number = ""
			}
		})

	},
	methods: {
		async searchNumber() {
			if (this.number === "") {
				return
			}
			const response = await this.loadMore()

			this.dataRepost = []

			this.headleNumber(response.map(item => Number(item.attributes.Number))).forEach((item) => {
				this.dataRepost.push({
					...response[response.findIndex(response =>  response.attributes.Number === item.split('->')[0])].attributes,
					Number: item,
					Money: (item.split('->').length > 1 ? item.split('->')[1] - item.split('->')[0] + 1 : 1) * 10000
				})
			})
		},
		async loadMore() {
			let request = await axiosClient.get(`/user-games?filters[Phone][$eq]=${this.number}&pagination[pageSize]=100`)

			const arrayData = []
			for (let index = 0; index < request.data.meta.pagination.pageCount; index++) {
				arrayData.push(async() => await axiosClient.get(`/user-games?filters[Phone][$eq]=${this.number}&pagination[pageSize]=100&pagination[page]=${index + 1}`))
			}

			const result =  []
			await Promise.all(arrayData.map(async (item) => await item())).then((response) => {
				response.forEach((response) =>{
					result.push(...response.data.data)
				})

			})

			return result
		},
		headleNumber(val) {
			let arrayNumber = val.sort((a, b) => a - b)
			const ranges = [];
			let start = null;
			let end = null;

			for (let i = 0; i < arrayNumber.length; i++) {
				if (start === null) {
				start = arrayNumber[i];
				end = arrayNumber[i];
				} else if (arrayNumber[i] === end + 1) {
				end = arrayNumber[i];
				} else {
				if (start === end) {
					ranges.push(String(start));
				} else {
					ranges.push(`${start}->${end}`);
				}
				start = arrayNumber[i];
				end = arrayNumber[i];
				}
			}

			if (start !== null) {
				if (start === end) {
				ranges.push(String(start));
				} else {
				ranges.push(`${start}->${end}`);
				}
			}

			return ranges
		},
	}
}
</script>

<style>
.lottery-text {
	font-family: "Alfa Slab One", serif;
	font-weight: 200;
	font-style: normal;
	text-align: center;
	font-size: 3rem;
	height: 4rem;
}

.layout {
	min-height: 100vh;
	background-color: #4158D0;
	background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);

}
</style>