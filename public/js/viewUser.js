 // JavaScript para garantir que apenas um checkbox "Principal" seja marcado por seção (Telefones e Emails)
 document.querySelectorAll('input[name="principalTelefone"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('input[name="principalTelefone"]').forEach(otherCheckbox => {
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = false;
                }
            });
        }
    });
});

 document.querySelectorAll('input[name="principalEmail"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('input[name="principalEmail"]').forEach(otherCheckbox => {
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = false;
                }
            });
        }
    });
});