<template>
	<v-layout column style="width: 100vw" d-flex align-center>
		<v-container style="max-width: 1500px">
			<v-card class="ma-16 mb-2 pa-4 d-flex font-weight-bold" outlined color="#FFD0D0" rounded="lg" style="border: 2px solid;">
				<div style="width: 20%;" class="text-center">
					Số điện thoại
				</div>
				<div style="width: 20%;" class="text-center">
					Tên
				</div>
                <div style="width: 40%;" class="text-center">
					Địa chỉ
				</div>
				<div style="width: 20%;" class="text-center">
					Số đã mua
				</div>
			</v-card>

			<div id="list">
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
			number: "",
			dataRepost: [],
            idLast: 0,
            index: 0
		}
	},
	async mounted() {
        // get last id
        console.time();
        await this.beginrequestData()
		this.interval()

	},
	methods: {
        interval () {
            setTimeout(async() => {
                await this.requestData()
                console.timeLog();
                console.log(this.index++)
                setTimeout(this.interval(),100)
            }, 10000)
        },
        async requestData() {
            let request = (await axiosClient.get(`/user-games?pagination[pageSize]=100&sort[0]=id:desc`)).data.data

            if (request[request.length - 1].id >= this.idLast) {
                const page = 2
                do {
                    request.push(...(await axiosClient.get(`/user-games?pagination[pageSize]=100&sort[0]=id:desc&pagination[page]=${page}`)).data.data)
                    page++
                } while (request[request.length - 1].id >= this.idLast);
            }

            const positionCurrent = request.findIndex(item => item.id === this.idLast)

            this.idLast = request[0].id

            if (positionCurrent) {
                this.handleData(request.slice(0,positionCurrent).reverse())
            }
        },
        async beginrequestData() {
			let request = await axiosClient.get(`/user-games?pagination[pageSize]=100`)

			const arrayData = []
			for (let index = 0; index < request.data.meta.pagination.pageCount; index++) {
				arrayData.push(async() => await axiosClient.get(`/user-games?pagination[pageSize]=100&pagination[page]=${index + 1}&sort[0]=Number:asc`))
			}

			const result =  []
			await Promise.all(arrayData.map(async (item) => await item())).then((response) => {
				response.forEach((response) =>{
					result.push(...response.data.data)
				})

			})

            console.log(result[result.length - 1].id)

            this.idLast = result[result.length - 1].id

            await this.handleData(result)
		},

        async handleData(data) {
            // merge consecutive data names
            let dataRepost = []
            let temp = data[0]
            for (let index = 1; index < data.length; index++) {
                if (data[index].attributes.Phone === temp.attributes.Phone && data[index].attributes.Name === temp.attributes.Name && data[index].attributes.Address === temp.attributes.Address&&Number(temp.attributes.Number.split('->').at(-1)) === Number(data[index].attributes.Number) - 1) {
                    temp.attributes.Number = temp.attributes.Number + "->" + data[index].attributes.Number
                } else {
                    dataRepost.push(temp)
                    temp = data[index]
                }
            }

            dataRepost.push(temp)

            await dataRepost.forEach((item) => item.attributes.Number = item.attributes.Number.split('->').length > 1 ? item.attributes.Number.split('->')[0] + "->" + item.attributes.Number.split('->')[item.attributes.Number.split('->').length - 1] : item.attributes.Number)

            for (let index = 0; index < dataRepost.length; index++) {
                const listGroup = document.getElementById("list")
                const newList = document.createElement("div")

				newList.classList.add("mx-16", "d-flex", "v-card")
				newList.setAttribute("id", "listCard")
				newList.setAttribute("elevation", "24")
				newList.setAttribute("rounded", "lg")
				newList.setAttribute("style", "transition: all 1s cubic-bezier(.36,-0.64,.34,1.76); transform: rotateX(90deg); height: 0; font-size: 0; padding: 0; margin-bottom: 0")
				newList.innerHTML = `
                    <div style="width: 20%;" class="text-center">
                        ${dataRepost[index].attributes.Phone}
                    </div>
					<div style="width: 20%;" class="text-center">
						${dataRepost[index].attributes.Name}
					</div>
                    <div style="width: 40%;" class="text-center">
                        ${dataRepost[index].attributes.Address}
                    </div>
                    <div style="width: 20%;" class="text-center">
                        ${dataRepost[index].attributes.Number}
                    </div>
				`
				listGroup.insertBefore(newList, listGroup.firstChild)

				await new Promise((result) => setTimeout(() => {
					newList.style.height = "auto"
					newList.style.fontSize = "1rem"
					newList.style.padding = "16px"
					newList.style.marginBottom = "8px"
					newList.style.transform = "rotateX(0deg)"
                    result()
				}, 10))
            }
        },

        async importElement() {


        },
        convertMoney(value) {
            value = value.toString()
			let result = ""
			for (let index = 0; index < value.length; index++) {
				if (index % 3 === 0 && index !== 0) {
					result = value[value.length - index - 1] + " " + result
				} else {
					result = value[value.length - index - 1] + result
				}
			}

			return result
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
</style>