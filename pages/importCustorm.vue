<template>
	<v-layout column style="width: 100vw" d-flex align-center>
		<v-card class="d-flex ma-16 pa-4" rounded="lg">
			<v-form style="width: calc(100% - 150px);">
				<div class="d-flex" style="width: 100%;">
					<v-text-field
						name="startNumber"
						label="Từ số"
						outlined
						id="id"
						:value="startNumber"
						@change="value => startNumber = Number(value)"
						hint="Số này đã có"
						suffix="số"
						class="pa-2"
						hide-details=""
						style="width: 15%"
					></v-text-field>
					<v-text-field
						name="endNumber"
						label="Đến số"
						outlined
						id="id"
						:value="endNumber"
						@change="value => endNumber = Number(value)"
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
						@change="searchDataUser()"
						id="id"
						hide-details
						class="pa-2"
						style="width: 20%"
					>
						<template v-slot:append>
							<v-tooltip top>
								<template v-slot:activator="{ on }">
									<v-icon v-on="on" color="amber" :disabled="!autoFill.boolean" @click="writeFill">mdi-flash</v-icon>
								</template>
								Tự điền thông tin
							</v-tooltip>
						</template>
					</v-text-field>
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
				<v-text-field
					name="organization"
					label="Hội đoàn"
					v-model="organization"
					outlined
					id="id"
					class="pa-2"
					style="width: 100%"
					hide-details
				></v-text-field>
			</v-form>
			<v-btn
				color="success"
				:disabled="
					loading ||
					!name ||
					!phone ||
					!startNumber ||
					dataEndNumber == startNumber ||
					(
						!!endNumber &&
						(
							startNumber > endNumber ||
							!(
								Math.max(dataEndNumber, startNumber, endNumber) === dataEndNumber ||
								Math.min(dataEndNumber, startNumber, endNumber) === dataEndNumber
							)
						)
					)
				"
				x-large
				class="my-2 mx-2"
				width="150"
				height="125"
				@click="importData()"
			>
				Nhập
			</v-btn>
		</v-card>

		<v-alert
			v-if="
				(!! startNumber && dataEndNumber == startNumber) ||
				(
					!! endNumber &&
					!(
						Math.max(dataEndNumber, startNumber, endNumber) === dataEndNumber ||
						Math.min(dataEndNumber, startNumber, endNumber) === dataEndNumber
					)
				)
			"
			transition="scale-transition"
			type="error"
		>
			{{
				`Số ${dataEndNumber} đã có có trong dữ liệu`
			}}
		</v-alert>



		<!-- <h1 class="white--text">
			{{ money }} số x 10 000 = {{ this.displayMoney }} 000 VNĐ
		</h1> -->

		<v-container style="max-width: 1050px">
			<v-card v-if="dataRepost.length" class="ma-16 mb-2 pa-4 d-flex font-weight-bold" outlined color="#FFD0D0" rounded="lg" style="border: 2px solid;">
				<div style="width: 30%;" class="text-center">
					Tên
				</div>
				<div style="width: 70%;" class="text-center">
					Số đã mua
				</div>
			</v-card>

			<div id="list">
				<!-- <v-card class="mx-16 d-flex" v-for="(item, index) in dataRepost" :key="`card-${index}`" id="listCard" :name="`card-${dataRepost.length-index}`" elevation="24" rounded="lg" :style="index?'padding: 16px; marginBottom: 8px':'height: 0; marginBottom: 0; font-size: 0; padding: 0; transition: none'">
					<div style="width: 30%;" class="text-center">
						{{ item.Name }}
					</div>
					<div style="width: 30%;" class="text-center">
						{{ item.Money }}
					</div>
					<div style="width: 40%;" class="text-center">
						{{ item.Number }}
					</div>
				</v-card> -->
			</div>
		</v-container>



	</v-layout>

</template>

<script>
import { set } from 'vue';
import axiosClient from "../api/clientAPI";
export default {
	data()  {
		return {
			files: [],
			totalLoad: undefined,
			nameLoad: undefined,
			startNumber: undefined,
			endNumber: undefined,
			name: "",
			phone: "",
			organization: "",
			address: "",
			displayMoney: 10,
			indexNumber: 0,
			numberRepost:[],
			dataRepost: [],
			checkStartNumber: undefined,
			checkEndNumber: undefined,
			dataEndNumber: undefined,
			autoFill: {
				boolean: false,
				data: {
					Name: "",
					Phone: "",
					Address: "",
					Organization: ""
				}
			},
			// displayNumber: [],
			loading: false,
		}
	},
	mounted() {
		// listen for the event key esc
		window.addEventListener('keyup', (e)=>{
			if(e.key === 'Escape') {
				this.resetData()
			}
		})

	},
	watch: {
		files () {
			console.log(this.files)
		},

		async startNumber(value) {
			if (value) {
				this.dataEndNumber = Number((await axiosClient.get(`/user-games?sort[1]=Number:asc&pagination[pageSize]=1&filters[Number][$gte]=${this.startNumber}`)).data.data[0]?.attributes.Number ?? 0)
			}
		},

		// money() {
		// 	let value = String(this.money * 10)

		// 	this.displayMoney = this.convertMoney(value)
		// }
	},
	methods: {
		writeFill() {
			console.log("this.autoFill.data")
			this.name = this.autoFill.data.Name
			this.phone = this.autoFill.data.Phone
			this.address = this.autoFill.data.Address
			this.organization = this.autoFill.data.Organization
		},
		searchDataUser() {
			if (this.phone.length === 10) {
				axiosClient.get(`/user-games?filters[Phone]=${this.phone}`).then((res) => {
					console.log(res.data.data)
					if (res.data.data.length) {
						this.autoFill.boolean = true
						this.autoFill.data = {
							Name: res.data.data[0].attributes.Name,
							Phone: res.data.data[0].attributes.Phone,
							Address: res.data.data[0].attributes.Address,
							Organization: res.data.data[0].attributes.Organization
						}
					} else {
						this.autoFill.boolean = false
					}
				})
			} else {
				this.autoFill.boolean = false
			}
		},
		async importData() {
			if (
					this.name === "" ||
					this.phone === "" ||
					!this.startNumber ||
					this.dataEndNumber === this.startNumber ||
					(
						!!this.endNumber &&
						(
							this.startNumber > this.endNumber ||
							!(
								Math.max(this.dataEndNumber, this.startNumber, this.endNumber) === this.dataEndNumber ||
								Math.min(this.dataEndNumber, this.startNumber, this.endNumber) === this.dataEndNumber
							)
						)
					)
				) {
				console.log("Vui lòng nhập đầy đủ thông tin")
				return
			}
			this.numberRepost = []
			this.loading = true
			this.indexNumber = this.startNumber
			this.phone = this.phone.replace(/ /g, "")
			await Promise.all(
				Array.from(
					{ length: (this.endNumber != 0 && this.endNumber) ? (this.endNumber - this.startNumber + 1) : 1 },
					(_, i) => i + this.startNumber
				).map(async (index) => {
					await this.createPermanentNumber({
						data: {
							Name: this.name,
							Number: index,
							Phone: this.phone,
							Address: this.address,
							Organization: this.organization
						}
					}, index);

					this.nameLoad = this.name;
				})
			);

			this.headleNumber({
				Name: this.name,
				Phone: this.phone,
				Address: this.address,
				Organization: this.organization,
				Money: this.money
			});
			this.loading = false
			this.resetData()
		},
		async createPermanentNumber(data, number) {
			try {
				const repost = await axiosClient.post("/user-games",data)

				this.numberRepost.push(Number(repost.data.data.attributes.Number))

			} catch(error) {
				this.$root.$emit("alert", {mess: `Số ${number.toString().padStart(4,"0")}: đã tồn tại`})
			}
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
		resetData() {
			this.startNumber = undefined
			this.endNumber = undefined
			this.name = ""
			this.phone = ""
			this.address = ""
			this.displayNumber = ""
			this.checkEndNumber = undefined
			this.checkStartNumber = undefined
			this.organization = ""
		},
		headleNumber(dataRepost) {
			console.log(this.numberRepost, "numberRepost")
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
				console.log(item)
				this.dataRepost = [{
					...dataRepost,
					Number: item
				}, ...this.dataRepost]
				const listGroup = document.getElementById("list")
				const newList = document.createElement("div")
				newList.classList.add("mx-16", "d-flex", "v-card")
				newList.setAttribute("id", "listCard")
				newList.setAttribute("elevation", "24")
				newList.setAttribute("rounded", "lg")
				newList.setAttribute("style", "transition: all 1s cubic-bezier(.36,-0.64,.34,1.76); transform: rotateX(90deg); height: 0; font-size: 0; padding: 0; margin-bottom: 0")
				newList.innerHTML = `
					<div style="width: 30%;" class="text-center">
						${dataRepost.Name}
					</div>
					<div style="width: 70%;" class="text-center">
						${ranges}
					</div>
				`
				listGroup.insertBefore(newList, listGroup.firstChild)

				setTimeout(() => {
					newList.style.height = "auto"
					newList.style.fontSize = "1rem"
					newList.style.padding = "16px"
					newList.style.marginBottom = "8px"
					newList.style.transform = "rotateX(0deg)"
					// document.getElementsByName(`card-${this.dataRepost.length}`)[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
				}, 10)
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

<style lang="scss">
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
#listCard:nth-last-child(odd) {
	background: #ffffff;
}

#listCard{
	transition: all 1s ease-in-out;
	border: 2px solid;
	border-radius: 8px;
}

#listCard.show {
	height: 100px;
	transform: scale(1, 1);
}

@keyframes transfer {
	0% {
		height: 0;
		font-size: 0;
	}
	100% {
		height: auto;
		font-size: 1rem;
	}
}

</style>