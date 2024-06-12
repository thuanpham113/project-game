<template>
  <v-app>
    <v-main>
        <Nuxt />
        <div name="alert">
            <v-alert
                v-for="(item,index) in alert"
                :key="index"
                :value="true"
                type="warning"
                @input="alert.splice(index,1)"
            >
                {{item.mess}}
            </v-alert>
        </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      alert: [],
    }
  },
  mounted() {
    this.$root.$on('alert',(data) => {
      this.alert.push(data)})
  }
}
</script>

<style>
div[name="alert"] {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    top: 0;
    right: 50vh;
    z-index: 9999;
    width: 100%;
    max-width: 400px;
    padding: 10px;
}
</style>