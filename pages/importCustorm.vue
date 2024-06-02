<template>
	<v-layout column style="width: 100vw" d-flex align-center>
		<v-card class="d-flex ma-16 pa-4" rounded="lg">
			<v-form style="width: calc(100% - 150px);">
				<div class="d-flex" style="width: 100%;">
					<v-text-field
						name="money"
						label="Số"
						outlined
						id="id"
						:value="money"
						@change="value => money = value"
						suffix="số"
						class="pa-2"
						hide-details
						style="width: 15%"
					></v-text-field>
					<v-text-field
						name="name"
						label="Họ và tên"
						outlined
						v-model="name"
						id="id"
						hide-details
						class="pa-2"
						style="width: 20%"
					></v-text-field>
					<v-text-field
						name="phone"
						label="Số điện thoại"
						outlined
						v-model="phone"
						id="id"
						hide-details
						class="pa-2"
						style="width: 20%"
					></v-text-field>
				</div>
				<v-text-field
					name="address"
					label="Địa chỉ"
					v-model="address"
					outlined
					id="id"
					class="pa-2"
					style="width: 100%"
					hide-details
				></v-text-field>
			</v-form>
			<v-btn color="success" :disabled="loading" x-large class="my-2 mx-2" width="150" height="125" @click="importData()">Nhập</v-btn>
		</v-card>



		<h1 class="white--text">
			{{ money }} số x 10 000 = {{ this.displayMoney }} 000 VNĐ
		</h1>

		<v-container style="max-width: 1050px">
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
			files: [],
			totalLoad: undefined,
			nameLoad: undefined,
			money: 1,
			name: "",
			phone: "",
			address: "",
			displayMoney: 10,
			indexNumber: 0,
			numberRepost:[],
			dataRepost: [],
			displayNumber: [],
			loading: false,
		}
	},
	mounted() {
		// listen for the event key esc
		window.addEventListener('keyup', (e)=>{
			if(e.key === 'Escape') {
				this.money = 1
				this.name = ""
				this.phone = ""
				this.address = ""
				this.displayNumber = ""
			}
		})

	},
	watch: {
		files () {
			console.log(this.files)
		},

		money() {
			let value = String(this.money * 10)

			this.displayMoney = this.convertMoney(value)
		}
	},
	methods: {
		async importData() {
			if (this.name === "" || this.phone === "" || this.address === "") {
				console.log("Vui lòng nhập đầy đủ thông tin")
				return
			}
			this.numberRepost = []
			this.loading = true
			this.indexNumber = (await axiosClient.get("/user-games?sort[1]=Number:desc&pagination[pageSize]=1")).data.data[0].attributes.Number
			this.phone = this.phone.replace(/ /g, "")
			for (let index = 0; index < this.money; index++) {
				await this.createNumber({
					data: {
						Name: this.name,
						Number: this.indexNumber,
						Phone: this.phone,
						Address: this.address
					}
				}, this.indexNumber, 1)

				this.nameLoad = this.name;
			}

			this.headleNumber({
				Name: this.name,
				Phone: this.phone,
				Address: this.address,
				Money: this.money
			});
			this.loading = false
		},
		async createNumber(data, number,  difference) {
			try {
				data.data.Number = Number(this.indexNumber) + difference
				const repost = await axiosClient.post("/user-games",data)

				this.indexNumber = Number(this.indexNumber) + difference

				this.numberRepost.push(Number(repost.data.data.attributes.Number))

			} catch(error) {
				console.error(error)
				await this.createNumber(data, number, difference + 1)
			}
		},
		headleNumber(dataRepost) {
			let arrayNumber = this.numberRepost.sort((a, b) => a - b)
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
					ranges.push(start);
				} else {
					ranges.push(`${start}->${end}`);
				}
				start = arrayNumber[i];
				end = arrayNumber[i];
				}
			}

			if (start !== null) {
				if (start === end) {
				ranges.push(start);
				} else {
				ranges.push(`${start}->${end}`);
				}
			}

			ranges.forEach((item) => {
				this.dataRepost = [{
					...dataRepost,
					Money: this.convertMoney(dataRepost.Money + "0000"),
					Number: item
				}, ...this.dataRepost]
			})
		},
		convertMoney(value) {
			let result = ""
			for (let index = 0; index < value.length; index++) {
				if (index % 3 === 0 && index !== 0) {
					result = value[value.length - index - 1] + " " + result
				} else {
					result = value[value.length - index - 1] + result
				}
			}

			return result
		}
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

#listCard:nth-last-child(even) {
	background: #FEFFD2;
}

@keyframes transfer {
	0% {
		transform: scale(1,0);
	}
	100% {
		transform: scale(1,1);
	}
}

</style>