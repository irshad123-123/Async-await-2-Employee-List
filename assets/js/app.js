let cl = console.log;

const showModal = document.getElementById('showModal')
const backDrop = document.getElementById('backDrop')
const empmodal = document.getElementById('empmodal')
const onToggle = document.querySelectorAll('.onToggle')
const empForm = document.getElementById('empForm')
const EIDControler = document.getElementById('EID')
const nameControler = document.getElementById('name')
const departmentControler = document.getElementById('department')
const cityControler = document.getElementById('city')
const addEmp = document.getElementById('addEmp')
const updateEmp = document.getElementById('updateEmp')
const empContainer = document.getElementById('empContainer')
const loader = document.getElementById('loader')
const arrow = document.getElementById('arrow')
const searchForm = document.getElementById('searchForm')
const searchControler = document.getElementById('search')

const snackBar = (msg, icon) => {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 1500
    })
}



const onSearchSubmit = (eve) => {
    eve.preventDefault()
    let keyword = searchControler.value.toLowerCase().trim()

        // localStorage.setItem("backupRows", empContainer.innerHTML);

    let rows = document.querySelectorAll('#empContainer tr')
    let found = false;
    searchForm.reset()
    rows.forEach(row => {
        let eid = row.children[0].innerText.toLowerCase()
        let name = row.children[1].innerText.toLowerCase()
        let dept = row.children[2].innerText.toLowerCase()
        let city = row.children[3].innerText.toLowerCase()

        if (
            eid.includes(keyword) ||
            name.includes(keyword) ||
            dept.includes(keyword) ||
            city.includes(keyword)
        ) {
            row.style.display = ""   // ✅ matched row dikhega
            found = true
        } else {
            row.style.display = "none" // ✅ non-matched hide ho jayega
            searchForm.style.display = "none"
            showModal.style.display = "none"
        }
    })

    if (found) {
        empContainer.innerHTML += `<tr><td colspan="6" class="text-center text-danger">
        <button class="btn btn-danger" onclick ="onBack()"><i role="button" class="fa-regular fa-circle-left"></i> Go Back</button>
        </td></tr>`
        // empContainer.innerHTML = `No result found`
    } else {
        empContainer.innerHTML = `<tr><td colspan="6" class="text-center text-danger">No result found <br><br>
        <button class="btn btn-danger" onclick ="onBack()"><i role="button" class="fa-regular fa-circle-left"></i> Go Back</button>
        </td></tr>`
    }
    searchForm.style.display = "none";
    showModal.style.display = "none";


}

const onBack = () => {
    callAllEmp();

    searchForm.style.display = "" // ✅ form wapas
    showModal.style.display = ""  // ✅ add button wapas
    // empContainer.style.display = ""
}

searchForm.addEventListener('submit', onSearchSubmit)

let BASE_URL = `https://crud-35fc1-default-rtdb.asia-southeast1.firebasedatabase.app`
let POSTS_URL = `${BASE_URL}/emp.json`

const onUpward = (eve) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
}

arrow.addEventListener('click', onUpward)

const onShowModal = (eve) => {
    backDrop.classList.toggle('active')
    empmodal.classList.toggle('active')

    empForm.reset()
    addEmp.classList.remove('d-none')
    updateEmp.classList.add('d-none')
}

showModal.addEventListener('click', onShowModal)
onToggle.forEach(f => f.addEventListener('click', onShowModal))

const objtoArr = (obj) => {
    let empArr = []
    for (const key in obj) {
        obj[key].id = key
        empArr.unshift(obj[key])
    }
    return empArr
}
// objtoArr()
const empTemplating = (arr) => {
    let result = ``;
    arr.forEach(obj => {
        result += `
                        <tr id="${obj.id}">
                            <td>${obj.EID}</td>
                            <td>${obj.Name}</td>
                            <td>${obj.Department}</td>
                            <td>${obj.City}</td>
                            <td><i onclick = "onEdit(this)" class="fa-solid fa-user-pen text-success fa-2x" role="button"></i></td>
                            <td><i onclick = "onRemove(this)" class="fa-solid fa-trash text-danger fa-2x" role="button"></i></td>
                        </tr>`
    })
    empContainer.innerHTML = result;
}

const onEdit = async (ele) => {
    let Edit_Id = ele.closest('tr').id;
    localStorage.setItem('Edit_Id', Edit_Id)
    // cl(Edit_Id)
    let Edit_URL = `${BASE_URL}/emp/${Edit_Id}.json`

    let res = await makeApiCall('GET', Edit_URL, null)
    EIDControler.value = res.EID;
    nameControler.value = res.Name;
    departmentControler.value = res.Department;
    cityControler.value = res.City

    addEmp.classList.add('d-none')
    updateEmp.classList.remove('d-none')

    backDrop.classList.toggle('active')
    empmodal.classList.toggle('active')

}

const onRemove = async (ele) => {
    let result = await Swal.fire({
        title: "Do you want to remove this Employee",
        showCancelButton: true,
        denyButtonText: `Don't save`
    })
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {

        let Remove_Id = ele.closest('tr').id
        let Remove_URL = `${BASE_URL}/emp/${Remove_Id}.json`

        let res = await makeApiCall('DELETE', Remove_URL, null)
        snackBar('Remove successfully!!!', 'success')
        ele.closest('tr').remove()
    }
};


const makeApiCall = async (methodName, api_url, msgBody) => {
    let msg = msgBody ? JSON.stringify(msgBody) : null
    loader.classList.remove('d-none')
    let res = await fetch(api_url, {
        method: methodName,
        body: msg,
        headers: {
            "auth": "JWT token form LS",
            "content-type": "application/json"
        }
    })
    try {
        if (!res.ok) {
            throw new Error('Network Error')
        }
        return res.json()
    }
    catch {
        cl('Error')
    } finally {
        loader.classList.add('d-none')
    }
}

const callAllEmp = async () => {
    let res = await makeApiCall('GET', POSTS_URL, null)
    let posts = objtoArr(res)
    empTemplating(posts)
}
callAllEmp()

const onSubmitEmp = async (eve) => {
    eve.preventDefault()
    let obj = {
        EID: EIDControler.value,
        Name: nameControler.value,
        Department: departmentControler.value,
        City: cityControler.value
    }
    cl(obj)
    onShowModal()
    let res = await makeApiCall('POST', POSTS_URL, obj)
    snackBar('New employee is added successfully!!!', 'success')
    let newId = res.name;
    obj.id = newId
    let tbody = document.createElement('tr')
    tbody.id = obj.id
    tbody.innerHTML = `<td>${obj.EID}</td>
                            <td>${obj.Name}</td>
                            <td>${obj.Department}</td>
                            <td>${obj.City}</td>
                            <td><i onclick = "onEdit(this)" class="fa-solid fa-user-pen text-success fa-2x" role="button"></i></td>
                            <td><i onclick = "onRemove(this)" class="fa-solid fa-trash text-danger fa-2x" role="button"></i></td>`
    empContainer.prepend(tbody)
}

empForm.addEventListener('submit', onSubmitEmp)

const onUpdateEmp = async (eve) => {
    let Update_Id = localStorage.getItem('Edit_Id')
    cl(Update_Id)
    let Update_URL = `${BASE_URL}/emp/${Update_Id}.json`
    let Update_Obj = {
        EID: EIDControler.value,
        Name: nameControler.value,
        Department: departmentControler.value,
        City: cityControler.value,
        id: Update_Id
    }
    cl(Update_Obj)

    let res = await makeApiCall('PATCH', Update_URL, Update_Obj)
    let tr = document.getElementById(Update_Id).children
    tr[0].innerHTML = res.EID
    tr[1].innerHTML = res.Name
    tr[2].innerHTML = res.Department
    tr[3].innerHTML = res.City

    onShowModal()
    snackBar('The info of Employee is updated successfully!!!', 'success')
}

updateEmp.addEventListener('click', onUpdateEmp)