import { capitalize, getFormData, sliceData, sortAsc, sortDesc } from './../../utils/utils.js';
// import { usersMockData } from './../../mocks/users.data.js';

export default function App(config) {
    this.config = config;
    this.sortStates = [];
    this.root = document.getElementById("root");
    this.data = [];
    this.filteredData = [];
    this.columnNames = [];
    this.slicedData = [];
    this.searchQuery = '';
    this.selectedRow = null;
    this.page = 1;
}

App.prototype.renderApp = function () {
    this.getData().then(() => {
        this.getColumnNames();
        this.RenderFilter();
        this.renderAddButton();
        this.renderTable();
    })
}

App.prototype.getColumnNames = function () {
    if (this.data.length > 0) {
        this.columnNames = Object.keys(this.data[0]).splice(0, this.config.columnSize);
        this.columnNames.forEach(columnName => {
            this.sortStates.push({
                state: 0
            });
        });
    }
}

App.prototype.getData = async function () {
    const resonse = await fetch(this.config.url);
    this.data = await resonse.json();
    // this.data = usersMockData;
}

App.prototype.renderTable = async function () {
    if (document.getElementById("data-table")) {
        document.getElementById("data-table").remove();
    }
    this.table = document.createElement("table");
    this.table.id = "data-table";
    this.table.classList.add('table');
    this.renderHead();
    this.renderBody();

    this.root.append(this.table);
    this.renderPagination();
}

App.prototype.renderHead = function () {
    const thead = document.createElement("thead");
    thead.classList.add("thead-dark");
    this.columnNames.forEach((keyName, i) => {
        let th = document.createElement("th");
        th.innerHTML = keyName + '';
        th.addEventListener("click", () => {
            switch (this.sortStates[i].state) {
                case 0:
                    this.sortStates[i].state = 1;
                    const sortStateIndex = this.sortStates.findIndex((sortState, key) => sortState.state !== 0 && key !== i);
                    if (this.sortStates[sortStateIndex]) {
                        this.sortStates[sortStateIndex].state = 0;
                    }
                    th.innerHTML = `${keyName}<span class="carrot"><i class="fa fa-angle-up" aria-hidden="true"></i></span>`;
                    break;

                case 1:
                    this.sortStates[i].state = 2;
                    th.innerHTML = `${keyName}<span class="carrot"><i class="fa fa-angle-down" aria-hidden="true"></i></span>`;
                    break;
                case 2:
                    this.sortStates[i].state = 1;
                    th.innerHTML = `${keyName}<span class="carrot"><i class="fa fa-angle-up" aria-hidden="true"></i></span>`;
                    break;
            }
            const ths = document.getElementsByTagName("th");
            let index = 0;
            for (let th in ths) {
                if (this.sortStates[index] && this.sortStates[index].state === 0 && ths[index].getElementsByClassName('carrot').length > 0 && index != i) {
                    ths[index].getElementsByClassName('carrot')[0].remove();
                }
                index++;
            }
            this.sortData();
            this.renderBody();
        });
        thead.append(th);
    });
    this.table.append(thead);
}

App.prototype.renderBody = function () {
    if (this.table.children[1]) {
        this.table.children[1].remove();
    }
    const tbody = document.createElement("tbody");
    this.filterData();
    this.slicedData = sliceData(this.filteredData, this.config.pageRowLimit);
    const data = this.slicedData[this.page - 1];
    if (data) {
        data.forEach((dataItem) => {
            let tr = document.createElement("tr");
            this.columnNames.forEach((keyName, i) => {
                let td = document.createElement("td");
                td.innerText = dataItem[keyName];
                tr.append(td);
            });
            tr.addEventListener("click", () => {
                this.selectedRow = dataItem;
                this.renderDataDetailed();
                const rows = tbody.childNodes;
                for (let i = 0; i < rows.length; i++) {
                    rows[i].classList.remove("active");
                }
                // console.log()
                tr.classList.add("active");
            });
            if (this.selectedRow && this.selectedRow.id === dataItem.id) {
                tr.classList.add("active")
            }
            tbody.append(tr);
        });
    } else {
        let tr = document.createElement("tr");
        tr.classList.add("text-center");
        tr.innerText = "No data";
        tbody.append(tr);
    }

    this.table.append(tbody);
}

App.prototype.sortData = function () {
    this.columnNames.forEach((keyName, i) => {
        switch (this.sortStates[i].state) {
            case 0:
                // this.data;
                break;
            case 1:
                this.data.sort(sortAsc.bind(this, keyName));
                break;

            case 2:
                this.data.sort(sortDesc.bind(this, keyName));
                break;
        }
    });
}

App.prototype.renderPagination = function () {
    if (document.getElementsByClassName("pagination")[0]) {
        document.getElementsByClassName("pagination")[0].remove();
    }
    const pagination = document.createElement("ul");
    pagination.classList.add("pagination");
    this.slicedData.forEach((data, i) => {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");
        if (i === 0) {
            pageItem.classList.add("active");
        }
        pageItem.addEventListener("click", () => {
            this.page = i + 1;
            const pageItems = pagination.childNodes;
            for (let i = 0; i < pagination.childNodes.length; i++) {
                pageItems[i].classList.remove("active");
            }
            pageItems[i].classList.add("active");
            this.renderBody();
        });
        const pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.innerText = i + 1;
        pageLink.href = "javascript:void(0)";
        pageItem.append(pageLink);

        pagination.append(pageItem);
    });
    this.root.append(pagination);
}

App.prototype.RenderFilter = function () {
    const form = document.createElement("form");
    const filter = document.createElement("div");
    filter.classList.add("input-group");
    filter.classList.add("mb-3");
    const findInput = document.createElement("input");
    findInput.classList.add("form-control");
    findInput.placeholder = "Enter a phrase";
    findInput.type = "text";
    filter.append(findInput);
    const inputGroupAppend = document.createElement("div");
    inputGroupAppend.classList.add("input-group-append");
    const button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-outline-secondary");
    button.type = "submit";
    button.innerText = "Search";
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.searchQuery = findInput.value;
        this.renderBody();
        this.renderPagination();
        this.renderDataDetailed();
    });
    inputGroupAppend.append(button);
    filter.append(inputGroupAppend);
    form.append(filter);
    this.root.append(form);
}

App.prototype.filterData = function () {
    const filteredData = this.data.filter((dataItem) => {
        let hits = 0;
        this.columnNames.forEach((columnName) => {
            (dataItem[columnName].toString().toLowerCase().indexOf(this.searchQuery.toString().toLowerCase()) !== -1) ? hits++ : null;
        });
        return (hits > 0);
    });
    this.filteredData = this.searchQuery ? filteredData : this.data;
}

App.prototype.renderDataDetailed = function () {
    if (document.getElementsByClassName("data-datailed")[0]) {
        document.getElementsByClassName("data-datailed")[0].remove();
    }
    const dataDetailed = document.createElement("div");
    dataDetailed.classList.add("data-datailed");
    dataDetailed.classList.add("bd-example");
    const userSelected = document.createElement("div");
    userSelected.innerHTML = `Selected user:&ensp;<b>${this.selectedRow.firstName} ${this.selectedRow.lastName}</b>`;
    const description = document.createElement("div");
    description.innerHTML = `Description:</br><textarea class="form-control">${this.selectedRow.description}</textarea>`;
    const address = document.createElement("div");
    address.innerHTML = `Address:<b>&ensp;${this.selectedRow.address.streetAddress}</b>`;
    const city = document.createElement("div");
    city.innerHTML = `City:<b>&ensp;${this.selectedRow.address.city}</b>`;
    const province = document.createElement("div");
    province.innerHTML = `State:<b>&ensp;${this.selectedRow.address.state}</b>`;
    const zip = document.createElement("div");
    zip.innerHTML = `Zip:<b>&ensp;${this.selectedRow.address.zip}</b>`;
    dataDetailed.append(userSelected);
    dataDetailed.append(description);
    dataDetailed.append(address);
    dataDetailed.append(city);
    dataDetailed.append(province);
    dataDetailed.append(zip);
    this.root.append(dataDetailed);
}

App.prototype.renderAddButton = function () {
    const addButton = document.createElement("div");
    addButton.classList.add("btn");
    addButton.classList.add("btn-primary");
    addButton.classList.add("float-right");
    addButton.classList.add("mb-3");
    addButton.innerText = "Add row";
    addButton.addEventListener("click", () => {
        this.renderPopup();
    })
    this.root.append(addButton);
}

App.prototype.renderPopup = function () {
    const popupWrap = document.createElement("div");
    popupWrap.classList.add("popup-wrap");
    const popup = document.createElement("div");
    popup.classList.add("popup");
    const container = document.createElement("form");
    container.classList.add("container");
    container.addEventListener("submit", (e) => {
        e.preventDefault();
        const payload = getFormData(e.target);
        payload.address = {
            streetAddress: "",
            city: "",
            state: "",
            zip: ""
        };
        payload.description = "";
        this.data.push(payload);
        this.renderTable();
        this.renderPagination();
        if (this.selectedRow) {
            this.renderDataDetailed();
        }
        popupWrap.remove();
    });
    const header = document.createElement("h3");
    header.classList.add("text-center");
    header.innerText = "Add row";
    container.append(header);

    this.columnNames.forEach((columnName) => {
        let formGroup = document.createElement("div");
        formGroup.classList.add("form-group");
        let label = document.createElement("label");
        label.innerText = capitalize(columnName);
        formGroup.append(label);
        let input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Enter ${columnName}`;
        input.classList.add("form-control");
        input.name = columnName;
        input.addEventListener("keyup", () => {
            this.validatePopupForm();
        });
        formGroup.append(input);
        container.append(formGroup);
    });
    const addButton = document.createElement("button");
    addButton.classList.add("btn");
    addButton.classList.add("btn-primary");
    addButton.style = "margin: auto;display: block; width: 100px;";
    addButton.innerText = "Add";
    addButton.type = "submit";
    container.append(addButton);
    popup.append(container);
    let closeBtn = document.createElement("div");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    closeBtn.addEventListener("click", function () {
        this.parentNode.parentNode.remove();
    });
    popup.append(closeBtn);
    popup.append(container);
    popupWrap.append(popup);
    document.body.append(popupWrap);
    this.validatePopupForm();
}

App.prototype.validatePopupForm = function () {
    const popupWrap = document.getElementsByClassName("popup-wrap")[0];
    const form = popupWrap.getElementsByClassName("container")[0];
    const formData = getFormData(form);
    const validValues = Object.values(formData).filter((value) => value !== '');
    if (validValues.length !== this.columnNames.length) {
        form.getElementsByClassName("btn")[0].disabled = true;
    } else {
        form.getElementsByClassName("btn")[0].disabled = false;
    }
}