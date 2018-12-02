import React, {Component} from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            categories: [],
            categoryId: 0,
            sortColumn: "",
            sortKey: "",
            sortOrder: "desc"
        };
    }


    fetchData = (url, callback) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
            callback(xhr.responseText);
        };
        xhr.send();
    };

    componentDidMount() {
        // Fetch categories
        this.fetchData(
            "https://skbank.azurewebsites.net/api/kategori",
            (data) => {
                this.setState({
                    categories: JSON.parse(data)
                })
            }
        );

        // Fetch transactions
        this.fetchData(
            "https://skbank.azurewebsites.net/api/transaksjon",
            (data) => {
                this.setState({
                    data: JSON.parse(data)
                })
            }
        );
    }

    updateSort = (sortKey, sortColumn) => {
        let sortOrder = "asc";
        if (this.state.sortOrder === "asc") {
            sortOrder = "desc";
        }
        this.setState({
            sortColumn: sortColumn,
            sortKey: sortKey,
            sortOrder: sortOrder
        })
    };

    handleCategoryEvent = (e) => {
        this.setState({
            categoryId: parseInt(e.target.value)
        });
    };

    sortTransactions = (transactions, sortKey, sortOrder) => {
        transactions.sort((a, b) => {
            if (sortOrder === "desc") {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                return 0;
            } else {
                if (b[sortKey] < a[sortKey]) {
                    return -1;
                }
                if (b[sortKey] > a[sortKey]) {
                    return 1;
                }
                return 0;
            }
        })
    };

    sumTotals = (transactions) => {
        let innTotal = 0;
        let outTotal = 0;
        transactions.forEach((trans) => {
            let value = trans.beloep;
            if (value >= 0) {
                innTotal += value;
            } else {
                outTotal += value;
            }
        });
        return {innTotal: innTotal, outTotal: outTotal}
    };

    filterTransactions = (transacations) => {
        if (this.state.categoryId) {
            return transacations.filter(trans =>
                trans.kategoriID === this.state.categoryId
            )
        }
        return transacations
    };

    renderTransactionRows = (transactions) => {
        return transactions.map((trans) => {
            return (
                <tr key={trans.transaksjonsID}>
                    <td>{trans.dato}</td>
                    <td>{trans.beskrivelse}</td>
                    <td className={"positiveValue"}>{(trans.beloep >= 0 && trans.beloep)}</td>
                    <td className={"negativeValue"}>{(trans.beloep < 0 && trans.beloep)}</td>
                </tr>
            )
        })
    };

    renderTransactionHeader = (sortColumn, sortOrder) => {
        return (
            <tr>
                <td>Dato <i
                    className={"fa fa-fw " + (sortColumn === "dato" ? "fa-sort-" + sortOrder : "fa-sort")}
                    onClick={this.updateSort.bind(this, "dato", "dato")}/></td>
                <td>Beskrivelse <i
                    className={"fa fa-fw " + (sortColumn === "beskrivelse" ? "fa-sort-" + sortOrder : "fa-sort")}
                    onClick={this.updateSort.bind(this, "beskrivelse", "beskrivelse")}/></td>
                <td>Inn <i
                    className={"fa fa-fw " + (sortColumn === "inn" ? "fa-sort-" + sortOrder : "fa-sort")}
                    onClick={this.updateSort.bind(this, "beloep", "inn")}/></td>
                <td>Ut <i
                    className={"fa fa-fw " + (sortColumn === "ut" ? "fa-sort-" + sortOrder : "fa-sort")}
                    onClick={this.updateSort.bind(this, "beloep", "ut")}/></td>
            </tr>
        )
    };

    renderCategories = (categories) => {
        return (
            <select onChange={this.handleCategoryEvent}>
                <option value={0}>Velg Kategori</option>
                {
                    (categories.map((kat) => {
                        return (
                            <option key={kat.kategoriID} value={kat.kategoriID}>{kat.beskrivelse}</option>
                        )
                    }))
                }
            </select>
        )
    };

    render() {
        let totals = {
            innTotal: 0,
            outTotal: 0
        };
        let transactions = this.state.data.transaksjoner;
        const categories = this.state.categories;
        const data = this.state.data;
        const sortKey = this.state.sortKey;
        const sortOrder = this.state.sortOrder;
        const sortColumn = this.state.sortColumn;

        if (transactions) {
            transactions = this.filterTransactions(transactions);
                totals = this.sumTotals(transactions);
            this.sortTransactions(transactions, sortKey, sortOrder);
        }

        return (
            <div className={"container p-3 border mt-3 mb-3 shadow"}>
                <div className={"kontoinformasjon pb-3"}>
                    <h3>xBanken</h3>
                    <p>Kontonavn: <span>{data.kontonavn}</span></p>
                    <p>Saldo: <span className={(data.saldo < 0 ? "negativeValue" : "neutralValue")}>{data.saldo}</span>
                    </p>
                    {(categories && this.renderCategories(categories))}
                </div>
                <div className={"transaksjoner"}>
                    <table className={"table table-striped border"}>
                        <thead>
                        {(categories && this.renderTransactionHeader(sortColumn, sortOrder))}
                        </thead>
                        <tbody>
                        {(transactions && this.renderTransactionRows(transactions))}
                        </tbody>
                    </table>
                    <div className={"sum pt-2"}>
                        <p>Sum inn: <span className={"positiveValue"}>{totals.innTotal.toFixed(2)}</span></p>
                        <p>Sum ut: <span className={"negativeValue"}>{totals.outTotal.toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
