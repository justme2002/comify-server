    import axios from 'axios'

    const category = document.getElementById("category").value
    const form = document.getElementById("catForm")

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const response = await axios.post("http://localhost:4000/createCategory", {
            category: category
        })

        console.log(response.data)
    })
    
