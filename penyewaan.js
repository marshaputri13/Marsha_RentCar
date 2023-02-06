const express = require("express")
const multer = require("multer") //untuk upload file
const path = require("path") // untuk memanggil path direktori
const fs = require("fs") //untuk manajemen file
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const moment = require("moment")

const app = express()
app.use(express.json())
app.use(express.static(__dirname));
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        //generate file name
        cb(null, "image-"+ Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "rent_car"
})


db.connect(error => {
    if (error) {
        console.log(error.message)
    } else {
        console.log("MySQL Connected")
    }
})

//--------------------------------------------- Menambah Data Mobil -------------------------------------------------

app.post("/mobil", upload.single("image"), (req, res) => {
    let data = {
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        image: req.file.filename
    }

    if (!req.file) {
        //jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        let sql = "insert into mobil set ?"

        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})


app.put("/mobil", upload.single("image"), (req, res) => {
    let data = null, sql = null
    let param = { id_mobil: req.body.id_mobil }
    
    if(!req.file) {
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari
        }
    } else {
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.filename
        }
        sql = "select * from mobil where ?"

        db.query(sql, param, (err, result) => {
            if (err) throw err

            let fileName = result[0].image

            let dir = path.join(__dirname, "image", fileName)
            fs.unlink(dir, (error) => {
            })
        })
    }
    sql = "update mobil set ? where ?"

    db.query(sql, [data,param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
    
    })

app.delete("/mobil/:id_mobil", (req, res) => {
    let param = {id_mobil: req.params.id_mobil}

    let sql = "select * from mobil where ?"

    db.query(sql, param, (error, result) => {
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                mobil: result
            }
        }
        res.json(response)
    })
})

app.post("/mobil", (req, res) => {

    let data = {
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        image: req.body.image
    }

    let sql = "insert into mobil set ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)
    })
})

app.put("/mobil", (req, res) => {

    let data = [

        {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.body.image
        },

        {
            id_mobil: req.body.id_mobil
        }
    ]

    let sql = "update mobil set ? where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response)
    })
})

app.delete("/mobil/:id_mobil", (req, res) => {
    let data = {
        id_mobil: req.params.id_mobil
    }


    // ambil data yang akan dihapus
    let sql = "select * from mobil where ?"
    // run query
    db.query(sql, data, (error, result) => {
        if (error) throw error
        
        // tampung nama file yang lama
        let fileName = result[0].image

        // hapus file yg lama
        let dir = path.join(__dirname,"image",fileName)
        fs.unlink(dir, (error) => {})
    })

    sql = "delete from mobil where ?"
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }      
    })
})
    

app.get("/mobil", (req, res) => {

    let sql = "select * from mobil"

    // run query
    db.query(sql, (error, result) => {
        if (error) throw error
        res.json({
            data: result,
            count: result.length
        })
    })
})

//pelanggan
app.get("/pelanggan", (req, res) => {
    let sql = "select * from pelanggan"
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                siswa: result
            }
        }
        res.json(response)
    })
})

app.get("/pelanggan/:id", (req, res) => {
    let data = {
        id_pelanggan: req.params.id
    }
    let sql = "select * from pelanggan where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                count: result.length,
                pelanggan: result
            }
        }
        res.json(response)
    })
})

app.post("/pelanggan", (req, res) => {
    let data = {
        id_pelanggan: req.body.id_pelanggan,
        nama_pelanggan: req.body.nama_pelanggan,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.kontak
    }
    let sql = "insert into pelanggan set ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data inserted"
            }
        }
        res.json(response)
    })
})

app.post("/pelanggan", (req, res) => {
    let data = {
        id_pelanggan: req.body.id_pelanggan,
        nama_pelanggan: req.body.nama_pelanggan,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.kontak
    }
    let sql = "insert into pelanggan set ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data inserted"
            }
        }
        res.json(response)
    })
})

app.put("/pelanggan", (req, res) => {
    let data = [
        {
            id_pelanggan: req.body.id_pelanggan,
            nama_pelanggan: req.body.nama_pelanggan,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.kontak
        },
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]
    let sql = "update pelanggan set ? where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data updated"
            }
        }
        res.json(response)
    })
})

app.delete("/pelanggan/:id", (req, res) => {
    let data = {
        id_pelanggan: req.params.id
    }

    let sql = "delete from pelanggan where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data deleted"
            }
        }
        res.json(response)
    })
})

//karyawan
app.get("/karyawan", (req, res) => {
    let sql = "select * from karyawan"
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                karyawan: result
            }
        }
        res.json(response)
    })
})

app.get("/karyawan/:id", (req, res) => {
    let data = {
        id_karyawan: req.params.id
    }
    let sql = "select * from karyawan where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                count: result.length,
                siswa: result
            }
        }
        res.json(response)
    })
})

app.post("/karyawan", (req, res) => {
    let data = {
        id_karyawan: req.body.id_karyawan,
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.kontak,
        username: req.body.username,
        password: req.body.password
    }
    let sql = "insert into karyawan set ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data inserted"
            }
        }
        res.json(response)
    })
})

app.post("/karyawan", (req, res) => {
    let data = {
        id_karyawan: req.body.id_karyawan,
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.kontak,
        username: req.body.username,
        password: req.body.password
    }
    let sql = "insert into karyawan set ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data inserted"
            }
        }
        res.json(response)
    })
})

app.put("/karyawan", (req, res) => {
    let data = [
        {
            id_karyawan: req.body.id_karyawan,
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.kontak,
            username: req.body.username,
            password: req.body.password
        },
        {
            id_karyawan: req.body.id_karyawan
        }
    ]
    let sql = "update karyawan set ? where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data updated"
            }
        }
        res.json(response)
    })
})

app.delete("/karyawan/:id", (req, res) => {
    let data = {
        id_karyawan: req.params.id
    }

    let sql = "delete from karyawan where ?"
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        }
        else {
            response = {
                message: result.affectedRows + "data deleted"
            }
        }
        res.json(response)
    })
})


app.listen(8000, () => {
    console.log("xixi")
})