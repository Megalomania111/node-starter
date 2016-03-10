$(document).ready(function () {
  $('#btn-delete-account').on('click', function () {
    swal({title: "Are you sure?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true 
    }, function(isConfirm){
      if (isConfirm) {
        $('#form-delete-account').submit();
      }
    });
  });
});