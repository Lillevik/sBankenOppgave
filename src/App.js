import React, {Component} from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: {},
            kategorier: [],
            categoryId: 0,
            sortColumn: "",
            sortKey: "",
            sortOrder: "desc"
        };
    }

    updateSort = (sortKey, sortColumn) => {
        let sortOrder = "asc";
        if(this.state.sortOrder === "asc"){
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
                    kategorier: JSON.parse(data)
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

    render() {
        let innTotal = 0;
        let outTotal = 0;
        let transaksjoner = this.state.data.transaksjoner;
        let kategorier = this.state.kategorier;
        let data = this.state.data;
        let sortKey = this.state.sortKey;
        let sortOrder = this.state.sortOrder;
        let sortColumn = this.state.sortColumn;

        if (this.state.categoryId && transaksjoner) {
            transaksjoner = transaksjoner.filter(trans =>
                trans.kategoriID === this.state.categoryId
            )
        }

        if (transaksjoner) {
            transaksjoner.forEach((trans) => {
                let value = trans.beloep;
                if (value >= 0) {
                    innTotal += value;
                } else {
                    outTotal += value;
                }
            });

            transaksjoner.sort((a, b) => {
                if(sortOrder === "desc"){
                    if(a[sortKey] < b[sortKey]) {
                        return -1;
                    }
                    if(a[sortKey] > b[sortKey]) {
                        return 1;
                    }
                    return 0;
                }else{
                    if(b[sortKey] < a[sortKey]) {
                        return -1;
                    }
                    if(b[sortKey] > a[sortKey]) {
                        return 1;
                    }
                    return 0;
                }
            })
        }

        return (
            <div className={"container p-3 border mt-3 mb-3 shadow"}>
                <div className={"kontoinformasjon pb-3"}>
                    <h3>xBanken</h3>
                    <p>Kontonavn: <span>{data.kontonavn}</span></p>
                    <p>Saldo: <span className={(data.saldo < 0 ? "negativeValue" : "neutralValue")}>{data.saldo}</span></p>
                    <select onChange={this.handleCategoryEvent}>
                        <option value={0}>Velg Kategori</option>
                        {(kategorier && kategorier.map((kat) => {
                            return (
                                <option key={kat.kategoriID} value={kat.kategoriID}>{kat.beskrivelse}</option>
                            )
                        }))}
                    </select>
                </div>
                <div className={"transaksjoner"}>
                    <table className={"table table-striped border"}>
                        <thead>
                        <tr>
                            <td>Dato <i className={"fa fa-fw " + (sortColumn === "dato" ? "fa-sort-" + sortOrder : "fa-sort")}
                                        onClick={this.updateSort.bind(this, "dato", "dato")}/></td>
                            <td>Beskrivelse <i className={"fa fa-fw " + (sortColumn === "beskrivelse" ? "fa-sort-" + sortOrder : "fa-sort")}
                                               onClick={this.updateSort.bind(this, "beskrivelse", "beskrivelse")}/></td>
                            <td>Inn <i className={"fa fa-fw " + (sortColumn === "inn" ? "fa-sort-" + sortOrder : "fa-sort")}
                                       onClick={this.updateSort.bind(this, "beloep", "inn")}/></td>
                            <td>Ut <i className={"fa fa-fw " + (sortColumn === "ut" ? "fa-sort-" + sortOrder : "fa-sort")}
                                      onClick={this.updateSort.bind(this, "beloep", "ut")}/></td>
                        </tr>
                        </thead>
                        <tbody>
                        {(transaksjoner && transaksjoner.map((trans) => {
                            return (
                                <tr key={trans.transaksjonsID}>
                                    <td>{trans.dato}</td>
                                    <td>{trans.beskrivelse}</td>
                                    <td className={"positiveValue"}>{(trans.beloep >= 0 && trans.beloep)}</td>
                                    <td className={"negativeValue"}>{(trans.beloep < 0 && trans.beloep)}</td>
                                </tr>
                            )
                        }))
                        }
                        </tbody>
                    </table>
                    <div className={"sum pt-2"}>
                        <p>Sum inn: <span className={"positiveValue"}>{innTotal.toFixed(2)}</span></p>
                        <p>Sum ut: <span className={"negativeValue"}>{outTotal.toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
