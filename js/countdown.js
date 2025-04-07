document.addEventListener("DOMContentLoaded", () => {
    // Obter elementos do contador
    const countDias = document.getElementById("countDias")
    const countHoras = document.getElementById("countHoras")
    const countMinutos = document.getElementById("countMinutos")
    const countSegundos = document.getElementById("countSegundos")
  
    // Definir data de expiração (30 dias a partir de hoje)
    const dataExp = new Date()
    dataExp.setDate(dataExp.getDate() + 30)
  
    // Atualizar a contagem regressiva
    function atualizarContagem() {
      const agora = new Date()
      const diff = dataExp.getTime() - agora.getTime()
  
      if (diff <= 0) {
        countDias.textContent = "00"
        countHoras.textContent = "00"
        countMinutos.textContent = "00"
        countSegundos.textContent = "00"
        return
      }
  
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const segundos = Math.floor((diff % (1000 * 60)) / 1000)
  
      countDias.textContent = dias.toString().padStart(2, "0")
      countHoras.textContent = horas.toString().padStart(2, "0")
      countMinutos.textContent = minutos.toString().padStart(2, "0")
      countSegundos.textContent = segundos.toString().padStart(2, "0")
    }
  
    // Atualizar a contagem a cada segundo
    atualizarContagem()
    setInterval(atualizarContagem, 1000)
  })
  
  