var firebaseConfig = {
    apiKey: "AIzaSyC9qC7YZIYFi1sfyp7EVq3xdLAe0YZJNdo",
    authDomain: "empresassindicato-5c068.firebaseapp.com",
    databaseURL: "https://empresassindicato-5c068-default-rtdb.firebaseio.com",
    projectId: "empresassindicato-5c068",
    storageBucket: "empresassindicato-5c068.appspot.com",
    messagingSenderId: "697262847818",
    appId: "1:697262847818:web:98e8ce8fc430b04d9df3b3",
    measurementId: "G-6TGLWBLRG0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var AppAdmin = angular.module('AppAdmin', ["firebase"])

AppAdmin.controller('ctrlLogin', function($scope, $http, $firebaseObject, $firebaseArray) {
    $scope.getLogin = function() {
        $.loader.open(); // opening the loader
        firebase.auth().signInWithEmailAndPassword($scope.obj.getUser, $scope.obj.getPass)
            .then((userCredential) => {
                window.location.href = 'home.html'
            })
            .catch((error) => {
                Swal.fire('Error', "La contraseña no es válida o el usuario no existe.", 'error')
                $.loader.close(true);
            });
    }
    $scope.loginMicrosoft = function() {
        var provider = new firebase.auth.OAuthProvider('microsoft.com');
        provider.addScope('User.Read');
        firebase.auth().signInWithPopup(provider).then(function(result) {})
    }
})
AppAdmin.controller('ctrlHome', function($scope, $http, $firebaseObject, $firebaseArray) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })
    $scope.viewData = false;
    $scope.filterUser = function(item) {
        if ($scope.tipo == "Cliente") {
            if (item.Correo == $scope.user) {
                return item;
            }
        } else {
            return item;
        }
    }
    $scope.getAuth = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                $scope.email = user.email;
                $scope.getPerfil();
            } else {
                window.location.href = 'index.html'
                    // No user is signed in.
            }
        });
    }
    $scope.getAuth();

    $scope.getPerfil = function() {
        $scope.rootDataPerfiles = firebase.database().ref().child('Data/perfiles').orderByChild('Correo').equalTo($scope.email);
        $scope.dataPerfil = $firebaseArray($scope.rootDataPerfiles); //Le pasa el arreglo a una variabble
        $scope.dataPerfil.$loaded().then(function() { //Cuando se cargue correct
            if ($scope.dataPerfil.length) {
                $scope.name = $scope.dataPerfil[0].Nombre;
                $scope.email = $scope.dataPerfil[0].Correo;
                $scope.user = $scope.dataPerfil[0].Correo;
                $scope.tipo = $scope.dataPerfil[0].Tipo;
                $scope.isNew = $scope.dataPerfil[0].isNew;
                if ($scope.dataPerfil[0].isNew) {
                    $("#modal-chanchesPass").modal("show")
                }
                $scope.getFirebase();
            } else {
                firebase.auth().currentUser.delete().then(function(user) { //Genera el login en firebase authentication                               '
                    $scope.errorLog = error;
                    $scope.allow = false;
                    $scope.notAllow = true;
                    $.loader.close(true);
                    $("#viewLogo").css('display', 'none');
                    $scope.$apply();
                })
            }
        })
    }
    $scope.newPassword = function() {
        swalWithBootstrapButtons.fire({
            title: '¿Deseas actualizar la contraseña?',
            text: "Los cambios no podrán deshacerse",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                $("#modal-newPass").modal("hide");
                $scope.dataPerfil[0].isNew = null
                var user = firebase.auth().currentUser;
                user.updatePassword($scope.newPass).then(function() {
                    $scope.dataPerfil.$save(0).then(function() {
                            swalWithBootstrapButtons.fire('Editada', 'La contraseña fue editada correctamente', 'success');
                            $.loader.close(true);
                        }).catch(function(error) {
                            alert(error);
                            $("#modal-newPass").modal("show")
                            $.loader.close(true);
                        })
                        // Update successful.
                }).catch(function(error) {
                    // An error happened.
                    alert(error);
                    $("#modal-newPass").modal("show")
                    $.loader.close(true);
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }
        })
    }
    $scope.getFirebase = function() {
        $scope.rootdataClientes = firebase.database().ref().child('Data/clientes')
        $scope.dataClientes = $firebaseArray($scope.rootdataClientes); //Le pasa el arreglo a una variabble
        $scope.dataClientes.$loaded().then(function() { //Cuando se cargue correctamnete los datos                                         
            setTimeout(function() {
                $('.select').selectpicker({
                    noneResultsText: 'Sin resultados',
                    title: "Seleccione una opción"
                });
                $("#viewLogo").css('display', 'none');
                $scope.viewAll = true;
                $scope.$apply();
                $.loader.close(); // closing the loader
            }, 100);

        })
    }
    $scope.closeSesion = function() {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html'
        });
    }
    $scope.getView = function(row) {
        $scope.editObjecto = row
    }
    $scope.clearModalNew = function() {
        $scope.newObjecto = {};
        $("#idSelect1").val("")
        $('.select').selectpicker({
            noneResultsText: 'Sin resultados',
            title: "Seleccione una opción",
        });
        $(".selectV").val('default');
        $(".selectV").selectpicker("refresh");
    }
    $scope.getDataEdit = function(data) {
        var rootDataSearch = firebase.database().ref().child('Data/solicitudes/' + data.$id);
        $scope.editObjecto = $firebaseObject(rootDataSearch); //Le pasa el arreglo a una variabble
        $scope.editObjecto.$loaded().then(function() { //Cuando se cargue correctamnete los datos    $scope.viewCliente = true;
            if ($scope.editObjecto.FechaDespido) {
                $("#idFechaDespidoEdit").val($scope.editObjecto.FechaDespido)
            }
        })
    }

    $scope.getData = function(data) {
        var rootDataSearch = firebase.database().ref().child('Data/solicitudes/' + data.$id);
        $scope.dataEdit = $firebaseObject(rootDataSearch); //Le pasa el arreglo a una variabble
        $scope.dataEdit.$loaded().then(function() { //Cuando se cargue correctamnete los datos    $scope.viewCliente = true;
            if ($scope.dataEdit.comentarios == undefined) {
                $scope.dataEdit.comentarios = [];
            }
        })
    }
    $scope.saveComent = function() {
        var obj = {
            user: $scope.email,
            name: $scope.name,
            date: moment().format("DD/MM/YYYY HH:mm"),
            comentario: $scope.sendText
        }
        $scope.dataEdit.comentarios.push(obj)
        $scope.dataEdit.$save().then(function() {
            Swal.fire('Realizado', 'Se agrego correctamente', 'success')
            $scope.sendText = "";
        })
    }
    $scope.getSearch = function() {
        $.loader.open(); // opening the loader    
        if (!$scope.sindicatoSearch) {
            Swal.fire('Error', "Seleccione una opción de tipo", 'error')
            $.loader.close(); // closing the loader
        } else {
            $.loader.open(); // opening the loader  
            $scope.rootDataSearch = firebase.database().ref().child('Data/solicitudes').orderByChild('idCliente').equalTo($scope.sindicatoSearch);
            $scope.dataSearch = $firebaseArray($scope.rootDataSearch); //Le pasa el arreglo a una variabble
            $scope.dataSearch.$loaded().then(function() { //Cuando se cargue correctamnete los datos    $scope.viewCliente = true;
                $scope.viewData = true
                setTimeout(function() {
                    $.loader.close(); // closing the loader
                }, 200);
            })

        }
    }

    $scope.saveEditSol = function() {
        swalWithBootstrapButtons.fire({
            title: '¿Deseas actualizar?',
            text: "Los cambios no podrán deshacerse",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                $("#edit-compra").modal("hide");
                for (var l = 0; l < $scope.dataClientes.length; l++) {
                    if ($scope.dataClientes[l].$id == $scope.editObjecto.idCliente) {
                        $scope.editObjecto.correo = $scope.dataClientes[l].Correo;
                        $scope.editObjecto.contacto = $scope.dataClientes[l].contacto;
                        $scope.editObjecto.cliente = $scope.dataClientes[l].Nombre;
                        break;
                    }
                }
                if ($("#idFechaDespidoEdit").val()) {
                    $scope.editObjecto.FechaDespido = $("#idFechaDespidoEdit").val();
                }
                $scope.editObjecto.$save().then(function() {
                    swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                    $.loader.close(true);
                }).catch(function(error) {
                    alert(error);
                    $("#edit-compra").modal("show")
                    $.loader.close(true);
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }
        })
    }

    $scope.saveCompra = function() {
        $("#new-compra").modal("hide");
        const rootAdd = firebase.database().ref().child('Data/solicitudes').orderByChild('dateC').equalTo(new Date().getTime()); //Crea una consulta
        $scope.dataAdd = $firebaseArray(rootAdd); //Le pasa el arreglo a una variabble
        $scope.dataAdd.$loaded().then(function() { //Cuando se cargue correctamnete los datos
            for (var l = 0; l < $scope.dataClientes.length; l++) {
                if ($scope.dataClientes[l].$id == $scope.newObjecto.idCliente) {
                    $scope.newObjecto.correo = $scope.dataClientes[l].Correo;
                    $scope.newObjecto.contacto = $scope.dataClientes[l].contacto;
                    $scope.newObjecto.cliente = $scope.dataClientes[l].Nombre;
                    break;
                }
            }
            if ($("#idFechaDespido").val()) {
                $scope.newObjecto.FechaDespido = $("#idFechaDespido").val();
            }
            $scope.dataAdd.$add($scope.newObjecto).then(function(ref) {
                Swal.fire('Realizado', 'Se agrego correctamente', 'success')
                $.loader.close(true);
            }).catch(function(error) {
                Swal.fire('Error', error, 'error')
                $("#new-compra").modal("show");
                $.loader.close(true);
            })
        })
    }
    $(".sidebar-dropdown > a").click(function() {
        $(".sidebar-submenu").slideUp(200);
        if (
            $(this)
            .parent()
            .hasClass("active")
        ) {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .parent()
                .removeClass("active");
        } else {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
            $(this)
                .parent()
                .addClass("active");
        }
    });

    $("#close-sidebar").click(function() {
        $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function() {
        $(".page-wrapper").addClass("toggled");
    });
})
AppAdmin.controller('ctrlPerfiles', function($scope, $http, $firebaseObject, $firebaseArray) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })
    $scope.getAuth = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                $scope.email = user.email;
                $scope.getPerfil();
            } else {
                window.location.href = 'index.html'
                    // No user is signed in.
            }
        });
    }
    $scope.getAuth();
    $scope.closeSesion = function() {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html'
        });
    }
    $scope.newPassword = function() {
        swalWithBootstrapButtons.fire({
            title: '¿Deseas actualizar la contraseña?',
            text: "Los cambios no podrán deshacerse",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                $("#modal-newPass").modal("hide");
                $scope.dataPerfil[0].isNew = null
                $scope.dataPerfil.$save(0).then(function() {
                    swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                    $.loader.close(true);
                }).catch(function(error) {
                    alert(error);
                    $("#modal-newPass").modal("show")
                    $.loader.close(true);
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }
        })
    }
    $scope.getPerfil = function() {
        $scope.rootDataPerfiles = firebase.database().ref().child('Data/perfiles').orderByChild('Correo').equalTo($scope.email);
        $scope.dataPerfil = $firebaseArray($scope.rootDataPerfiles);
        $scope.dataPerfil.$loaded().then(function() {
            if ($scope.dataPerfil.length) {
                $scope.name = $scope.dataPerfil[0].Nombre;
                $scope.email = $scope.dataPerfil[0].Correo;
                $scope.tipo = $scope.dataPerfil[0].Tipo;
                if ($scope.tipo == "Administrador") {
                    $scope.getFirebase();
                } else {
                    $scope.errorLog = "Sin acceso Perfil";
                    $scope.allow = false;
                    $scope.notAllow = true;
                    $("#viewLogo").css('display', 'none');
                    $.loader.close(true);
                }
            } else {
                firebase.auth().signInWithEmailAndPassword($scope.email, $scope.password).then(function(user) { //Genera el login en firebase authentication                               '
                    user.delete();
                })
                $scope.errorLog = "Sin acceso";
                $scope.allow = false;
                $scope.notAllow = true;
                $("#viewLogo").css('display', 'none');
                $.loader.close(true);
            }
        })
    }
    $scope.getFirebase = function() {
        $scope.RotdataPerfiles = firebase.database().ref().child('Data/perfiles')
        $scope.dataCuentas = $firebaseArray($scope.RotdataPerfiles);
        $scope.dataCuentas.$loaded().then(function() {
            setTimeout(function() {
                $(".fixTable").tableHeadFixer();
            }, 100);
            $("#viewLogo").css('display', 'none');
            $.loader.close();
            $scope.viewAll = true;
        })
    }
    $scope.clearModalNew = function() {
        $scope.newCuenta = {};
        $scope.newCuenta.isNew = true;
        $('#newCuenta-cuenta').val('')
    }
    $scope.newPassword = function() {
        swalWithBootstrapButtons.fire({
            title: '¿Deseas actualizar la contraseña?',
            text: "Los cambios no podrán deshacerse",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                $("#modal-newPass").modal("hide");
                $scope.dataPerfil[0].isNew = null
                $scope.dataPerfil.$save(0).then(function() {
                    swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                    $.loader.close(true);
                }).catch(function(error) {
                    alert(error);
                    $("#modal-newPass").modal("show")
                    $.loader.close(true);
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }
        })
    }
    $scope.newUserCuenta = function() {
        $.loader.open();
        var fly = true;
        for (var t = 0; t < $scope.dataCuentas.length; t++) {
            if ($scope.dataCuentas[t].Correo == $scope.newCuenta.Correo) {
                fly = false;
                break;
            }
        }
        if (fly) {
            $("#new-cuenta").modal("hide")
            $scope.dataCuentas.$add($scope.newCuenta).then(function(ref) {
                var data = "SoloriosAbogados2021"
                firebase.auth().createUserWithEmailAndPassword($scope.newCuenta.Correo, data)
                Swal.fire('Realizado', 'Se agrego correctamente', 'success')
                $.loader.close(true);
            }).catch(function(error) {
                Swal.fire('Error', error, 'error')
                $("#new-cuenta").modal("show")
                $.loader.close(true);
            })
        } else {
            $("#new-cuenta").modal("show")
            Swal.fire('Error', "El correo ya fue agregado", 'error')
            $("#new-cuenta").modal("show")
            $.loader.close(true);
        }
    }
    $scope.getEdit = function(row) {
        $.loader.open();
        var rootEditUser = firebase.database().ref('Data/perfiles/' + row.$id);
        $scope.editCuenta = $firebaseObject(rootEditUser);
        $scope.editCuenta.$loaded().then(function() {
            $.loader.close(true);
        }).catch(function(error) {
            alert(error);
            $.loader.close(true);
        })
    }
    $scope.saveEdit = function() {
        var fly = true;
        for (var t = 0; t < $scope.dataCuentas.length; t++) {
            if ($scope.dataCuentas[t].Correo == $scope.editCuenta.Correo && $scope.dataCuentas[t].$id != $scope.editCuenta.$id) {
                fly = false;
                break;
            }
        }
        if (fly) {
            swalWithBootstrapButtons.fire({
                title: '¿Deseas actualizar?',
                text: "Los cambios no podrán deshacerse",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'No, Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    $.loader.open();
                    $("#edit-cuenta").modal("hide");
                    $scope.editCuenta.$save().then(function() {
                        swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                        $.loader.close(true);
                    }).catch(function(error) {
                        alert(error);
                        $("#edit-cuenta").modal("show")
                        $.loader.close(true);
                    })
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
                }
            })
        } else {
            Swal.fire('Error', "El correo ya fue agregado", 'error')
            $.loader.close(true);
        }
    }
    $scope.removeUser = function(row) {
        swalWithBootstrapButtons.fire({
            title: '¿Desea eliminar al empleado?',
            text: "No podrá recuperar los datos",
            type: 'warning',
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                firebase.database().ref('Data/perfiles/' + row.$id).remove().then(function(ref) {
                    Swal.fire('Eliminado', 'Empleado eliminado', 'success')
                    $.loader.close(true)
                }).catch(function(error) {
                    alert(error);
                    $.loader.close(true);
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }

        })
    }
    $(".sidebar-dropdown > a").click(function() {
        $(".sidebar-submenu").slideUp(200);
        if (
            $(this)
            .parent()
            .hasClass("active")
        ) {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .parent()
                .removeClass("active");
        } else {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
            $(this)
                .parent()
                .addClass("active");
        }
    });
    $("#close-sidebar").click(function() {
        $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function() {
        $(".page-wrapper").addClass("toggled");
    });
})
AppAdmin.controller('ctrlCliente', function($scope, $http, $firebaseObject, $firebaseArray) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })
    $scope.getAuth = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                $scope.email = user.email;
                $scope.getPerfil();
            } else {
                window.location.href = 'index.html'
                    // No user is signed in.
            }
        });
    }
    $scope.getAuth();
    $scope.newPassword = function() {
        swalWithBootstrapButtons.fire({
            title: '¿Deseas actualizar la contraseña?',
            text: "Los cambios no podrán deshacerse",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                $("#modal-newPass").modal("hide");
                $scope.dataPerfil[0].isNew = null
                $scope.dataPerfil.$save(0).then(function() {
                    swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                    $.loader.close(true);
                }).catch(function(error) {
                    alert(error);
                    $("#modal-newPass").modal("show")
                    $.loader.close(true);
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }
        })
    }
    $scope.getPerfil = function() {
        $scope.rootDataPerfiles = firebase.database().ref().child('Data/perfiles').orderByChild('Correo').equalTo($scope.email);
        $scope.dataPerfil = $firebaseArray($scope.rootDataPerfiles);
        $scope.dataPerfil.$loaded().then(function() {
            if ($scope.dataPerfil.length) {
                $scope.name = $scope.dataPerfil[0].Nombre;
                $scope.email = $scope.dataPerfil[0].Correo;
                $scope.tipo = $scope.dataPerfil[0].Tipo;
                if ($scope.tipo == "Administrador") {
                    $scope.getFirebase();
                } else {
                    $scope.errorLog = "Sin acceso Perfil";
                    $scope.allow = false;
                    $scope.notAllow = true;
                    $("#viewLogo").css('display', 'none');
                    $.loader.close(true);
                }
            } else {
                firebase.auth().signInWithEmailAndPassword($scope.email, $scope.password).then(function(user) { //Genera el login en firebase authentication                               '
                    user.delete();
                })
                $scope.errorLog = "Sin acceso";
                $scope.allow = false;
                $scope.notAllow = true;
                $("#viewLogo").css('display', 'none');
                $.loader.close(true);
            }
        })
    }
    $scope.getFirebase = function() {
        $scope.RotdataPerfiles = firebase.database().ref().child('Data/clientes')
        $scope.dataCuentas = $firebaseArray($scope.RotdataPerfiles);
        $scope.dataCuentas.$loaded().then(function() {
            setTimeout(function() {
                $(".fixTable").tableHeadFixer();
            }, 100);
            $("#viewLogo").css('display', 'none');
            $.loader.close();
            $scope.viewAll = true;
        })
    }
    $scope.clearModalNew = function() {
        $scope.newCuenta = {};
        $('#newCuenta-cuenta').val('')
    }
    $scope.closeSesion = function() {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html'
        });
    }
    $scope.newUserCuenta = function() {
        $.loader.open();
        var fly = true;
        for (var t = 0; t < $scope.dataCuentas.length; t++) {
            if ($scope.dataCuentas[t].Correo == $scope.newCuenta.Correo) {
                fly = false;
                break;
            }
        }
        if (fly) {
            $("#new-cuenta").modal("hide")
            $scope.dataCuentas.$add($scope.newCuenta).then(function(ref) {
                Swal.fire('Realizado', 'Se agrego correctamente', 'success')
                $.loader.close(true);
            }).catch(function(error) {
                Swal.fire('Error', error, 'error')
                $("#new-cuenta").modal("show")
                $.loader.close(true);
            })
        } else {
            $("#new-cuenta").modal("show")
            Swal.fire('Error', "El correo ya fue agregado", 'error')
            $("#new-cuenta").modal("show")
            $.loader.close(true);
        }
    }
    $scope.getEdit = function(row) {
        $.loader.open();
        var rootEditUser = firebase.database().ref('Data/clientes/' + row.$id);
        $scope.editCuenta = $firebaseObject(rootEditUser);
        $scope.editCuenta.$loaded().then(function() {
            $.loader.close(true);
        }).catch(function(error) {
            alert(error);
            $.loader.close(true);
        })
    }
    $scope.saveEdit = function() {
        var fly = true;
        for (var t = 0; t < $scope.dataCuentas.length; t++) {
            if ($scope.dataCuentas[t].Correo == $scope.editCuenta.Correo && $scope.dataCuentas[t].$id != $scope.editCuenta.$id) {
                fly = false;
                break;
            }
        }
        if (fly) {
            swalWithBootstrapButtons.fire({
                title: '¿Deseas actualizar?',
                text: "Los cambios no podrán deshacerse",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'No, Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    $.loader.open();
                    $("#edit-cuenta").modal("hide");
                    $scope.editCuenta.$save().then(function() {
                        swalWithBootstrapButtons.fire('Editado', 'Editado correctamente', 'success');
                        $.loader.close(true);
                    }).catch(function(error) {
                        alert(error);
                        $("#edit-cuenta").modal("show")
                        $.loader.close(true);
                    })
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
                }
            })
        } else {
            Swal.fire('Error', "El correo ya fue agregado", 'error')
            $.loader.close(true);
        }
    }
    $scope.removeUser = function(row) {
        swalWithBootstrapButtons.fire({
            title: '¿Desea eliminar al empleado?',
            text: "No podrá recuperar los datos",
            type: 'warning',
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                $.loader.open();
                firebase.database().ref('Data/clientes/' + row.$id).remove().then(function(ref) {
                    Swal.fire('Eliminado', 'Cliente eliminado', 'success')
                    $.loader.close(true)
                }).catch(function(error) {
                    alert(error);
                    $.loader.close(true);
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire('Cancelado', 'La operación fue cancelada', 'error')
            }

        })
    }
    $(".sidebar-dropdown > a").click(function() {
        $(".sidebar-submenu").slideUp(200);
        if (
            $(this)
            .parent()
            .hasClass("active")
        ) {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .parent()
                .removeClass("active");
        } else {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
            $(this)
                .parent()
                .addClass("active");
        }
    });
    $("#close-sidebar").click(function() {
        $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function() {
        $(".page-wrapper").addClass("toggled");
    });
})