<template>
	<v-layout column style="height: 100vh; width: 100vw" d-flex align-center justify-center>

		<v-card height="80vh" width="80vh" rounded="circle" class="d-flex align-center justify-center">
			<input
				@change="changeFile"
				type="file"
				ref="input"
				hidden
			>

			<v-btn v-if="!totalLoad" icon @click="$refs.input.click()">
				<v-icon size="100">mdi-file</v-icon>
			</v-btn>


			<v-progress-circular
				v-if="totalLoad"
				:rotate="-90"
				:size="800"
     			:width="300"
				:color="Math.round(totalLoad *100) ==100 ? 'success' : 'light-blue'"
				height="10"
				:value="totalLoad*100"
				striped
			>
				<div class="lottery-text">
					{{ Math.round(totalLoad *100) }}
				</div>
			</v-progress-circular>
			<!-- <input v-if="totalLoad !==1 && totalLoad" :value="nameLoad" disabled  type="text" /> -->
		</v-card>
				<div class="lottery-text">
					{{ nameLoad }}
				</div>
	</v-layout>

</template>

<script>
import * as xlsx from 'xlsx';
import axiosClient from "../api/clientAPI";
export default {
	data()  {
		return {
			files: [],
			totalLoad: undefined,
			nameLoad: undefined
		}
	},
	watch: {
		files () {
			console.log(this.files)
		}
	},
	methods: {
		async changeFile(event) {
			const files = event.target.files[0]
			const fileReader = new FileReader();
			fileReader.readAsArrayBuffer(files);

			fileReader.onload = async() => {
				const arrayBuffer = fileReader.result;
				const workbook = await xlsx.read(arrayBuffer);

				const sheet = workbook.Sheets.Sheet1

				const column = sheet["!ref"].split(":")[1].match(/[0-9]+/g)[0]
				const row = sheet["!ref"].split(":")[1].match(/[A-z]+/g)[0]

				let columnName
				let columnNumber

				Object.keys(sheet).map(key => {
					if (sheet[key]?.v === "name") columnName = key.match(/[A-z]+/g)[0]
					if (sheet[key]?.v === "number") columnNumber = key.match(/[A-z]+/g)[0]
				})

				for (let index = 2; index < column; index++) {
					try {
						const data = await axiosClient.post("/user-games", {
							data: {
								Name: sheet[columnName+index]?.v,
								Number: String(sheet[columnNumber+index]?.v.toString().padStart(4, "0")),
							}
						})

						this.nameLoad = sheet[columnName+index]?.v;
					} catch(error) {
						console.error(error)
						const data = await axiosClient.post("/error-loads", {
							data: {
								status: error.response.data.error.status,
								message: error.response.data.error.message,
								details: JSON.stringify(error.response.data.error.details),
								data: JSON.stringify(error.response.config.data)
							}
						})
					}

					this.totalLoad = index/column;
				}
			};

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
</style>