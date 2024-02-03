<template>

	<v-layout column class="overflow-y-auto pa-4 pt-16" align-center fill-height style="background-image: url('/6466383.jpg'); background-size: cover;" >
			<div class="text-center lottery-text my-16 white--text">
				{{ title }}
			</div>

			<v-sheet width="500px" class="d-flex align-center ml-n10" color="transparent">
				<div class="pr-10 ml-n16 white--text lottery-text" style="font-size: 60px;">
					Số:
				</div>
				<v-otp-input
					:length="num"
					type="number"
					@change="(val) => {this.numberFinish = val}"
				/>
			</v-sheet>

			<!-- <v-btn color="success" @click.stop.prevent="start">Generator</v-btn> -->

			<v-data-table style="width: 80vw;" :headers="headers" :items="award" :items-per-page="-1" class="elevation-1"></v-data-table>

			<div class="d-flex justify-space-around" style="width: 80vw">
				<v-btn color="light-blue" class="px-16 my-2" @click="loadOldData">
					Đọc dữ liệu cũ
				</v-btn>
				<v-btn color="success" class="px-16 my-2" :loading="loadSave" @click="save">Lưu lại</v-btn>
			</div>

			<div class="d-flex justify-space-around" style="width: 80vw">
				<v-btn icon  v-if="rank>600" :to="`/lotteryGame/${+rank-10}`">
					<v-icon size="50" >mdi-arrow-left</v-icon>
				</v-btn>
				<v-btn icon to="/">
					<v-icon size="50" >mdi-home</v-icon>
				</v-btn>
				<v-btn icon :to="`/lotteryGame/${+rank+10}`"  v-if="rank<690 && rank>=600">
					<v-icon size="50" >mdi-arrow-right</v-icon>
				</v-btn>
			</div>

		<!-- <v-row>
			<v-col v-for="(num, index) in number" :key="index" class="input-field" cols="2">
				<input :id="`num${index + 1}`" type="text" class="validate lottery-text" disabled :value="num"
					style="width: 100%;">
			</v-col>
		</v-row> -->


	</v-layout>
</template>

<script>
import axiosClient from "~/api/clientAPI";
export default {
	data() {
		return {
			number: [0, 0, 0, 0],
			numberFinish: [0, 0, 0, 0],
			max: 9,
			min: 0,
			num: 4,
			maxNum: 10,
			minNum: 0,
			tmpNum: [],
			animateObj: {
				globalID: null,
				times: 0,
				endTimes: 100
			},
			option: {},
			rank: 100,
			listData: [],
			award: [],
			headers: [
				{
					text: "Number",
					value: "Number",
					width: "100px",
				},
					{
						text: "Name",
						value: "Name",
						align: "center"
					}
			],
			title: undefined,
			loadSave: false
		}
	},
	async mounted() {
		// const data = this.$route?.query

		const data = (await axiosClient.get(`/list-ranks?filters[Rank][$eq]=${this.$route?.params?.id}`)).data.data[0].attributes

		console.log(data)

		this.num = data.Num ?? 4;
		this.maxNum = data.max ?? 9999;
		this.minNum = data.min ?? 0;
		this.option = data.Option ?? undefined;
		this.rank = data.Rank ?? 100
		this.number = new Array(+this.num).fill(0)
		this.title = data.Name ?? undefined
		// this.$router.replace({ query:{step:5}});
	},
	watch: {
		async numberFinish() {
			const list = []
			let listMember;
			if (this.num < 4) {
				if (this.num == 2) {
					for (let index = this.option; index < this.option+10; index++) {
						list.push(index.toString().padStart(2, "0")+this.numberFinish)
					}
				} else if (this.num == 3) {
					for (let index = 0; index < 10; index++) {
						list.push(index.toString()+this.numberFinish)
					}
				}

				const promises = list.map(async (number) => {
					const dateList = await this.checkNumber(number);

					if (dateList.length) {
						return { ...dateList[0]?.attributes };
					} else {
						return null; // Hoặc giá trị mặc định khác nếu thích hợp
					}
				});

				listMember = await Promise.all(promises);

				this.award = listMember.filter(data => !!data).map(val => {
					return {
						...val,
						Rank: this.rank.toString().padStart(3, "0")
					}
				})
			} else if(this.num === 4) {
				const dateList = await this.checkNumber(this.numberFinish);
				listMember = [{...dateList[0]?.attributes}]
			}

			this.award = listMember.filter(data => !!data).map(val => {
				return {
					...val,
					Rank: this.rank.toString().padStart(3, "0")
				}
			})
		}
	},
	methods: {
		// start() {
		// 	this.getRandomAnimate();
		// },
		// getRandom(minNum, maxNum) {

		// 	return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
		// },
		// getRandomArray(minNum, maxNum, n) {
		// 	let rdmArray = [];
		// 	for (let i = 0; i < n; i++) {
		// 		let rdm = 0;
		// 		let exist = false;
		// 		do {
		// 			exist = false;
		// 			rdm = this.getRandom(minNum, maxNum);


		// 			if (rdmArray.indexOf(rdm) != -1) {
		// 				exist = true;
		// 			}
		// 		} while (exist);

		// 		rdmArray[i] = rdm;
		// 	}
		// 	return rdmArray;
		// },
		// getRandomAnimate() {
		// 	this.number = this.getRandomArray(this.min, this.max, this.num);

		// 	this.animateObj.times++;
		// 	if (this.animateObj.times < this.animateObj.endTimes) {
		// 		this.animateObj.globalID = requestAnimationFrame(this.getRandomAnimate);
		// 	} else {
		// 		this.getNumber();
		// 		this.animateObj = Object.assign({}, this.animateObj, {
		// 			globalID: null,
		// 			times: 0,
		// 		});
		// 	}
		// },
		// getNumber() {
		// 	this.tmpNum = this.getRandomArray(this.min, this.max, this.num);

		// 	this.tmpNum.sort(function (a, b) {
		// 		return a - b;
		// 	});
		// 	this.numberFinish = [].concat(this.tmpNum);
		// },
		async checkNumber(number) {
			const data = (await axiosClient.get(`/user-games?filters[Number][$eq]=${number}`)).data.data

			return data
		},
		async setListAward(data, rank) {
			const request = await axiosClient.post("/awards", {
					data: {
						...data[0].attributes,
						Rank: rank.toString().padStart(3, "0")
					}
				})
		},
		async save () {
			this.loadSave = true
			const promises = this.award.map(async (val) => {
				let request
				try {
					request = await axiosClient.post("/awards", {
						data: {
							...val,
							Rank: this.rank.toString().padStart(3, "0")
						}
					})
				} catch (err) {
					console.error(err)
				}

				return request ?? undefined
			});

			await Promise.all(promises);
			this.loadSave = false
		},
		async loadOldData () {
			const listMember = (await axiosClient.get(`/awards?filters[Rank][$eq]=${this.rank}`)).data.data

			this.award = listMember.map(val => {
				return {
					...val.attributes
				}
			})
		}
		// async getListData() {
		// 	this.award = (await axiosClient.get(`/awards?filters[Rank][$eq]=${this.rank.toString().padStart(3, "0")}`)).data.data.map((val) => {
		// 		return val.attributes
		// 	})
		// }
	}
};
</script>

<style>
.lottery-text {
	font-family: "Dancing Script", cursive;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
  font-size: 100px;
}
.kanit-thin {
  font-family: "Kanit", sans-serif;
  font-weight: 100;
  font-style: normal;
}

body{
	background-image: url("https://png.pngtree.com/background/20210710/original/pngtree-chinese-style-red-new-years-day-background-design-picture-image_980278.jpg");
}
</style>