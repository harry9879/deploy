$envVars = @{
    "JWT_EXPIRE" = "3d"
    "ADMIN_REGISTRATION_CODE" = "ADMIN2025SECRET"
    "EMAIL_HOST" = "smtp.gmail.com"
    "EMAIL_PORT" = "587"
    "EMAIL_SECURE" = "false"
    "EMAIL_USER" = "justharry793@gmail.com"
    "EMAIL_PASSWORD" = "6099h@Y#"
    "EMAIL_FROM" = "justharry793@gmail.com"
    "MAX_FILE_SIZE" = "209715200"
    "MAX_USER_STORAGE" = "524288000"
    "MAX_GLOBAL_STORAGE" = "10737418240"
    "SENDGRID_API_KEY" = "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"
    "AWS_ACCESS_KEY_ID" = "tid_bSPZpPIeYuJjvVp_LEWrRdOgIzFRaMgdREOGYHoqHyDoiqFwQV"
    "AWS_SECRET_ACCESS_KEY" = "tsec_maStNZju08vZfT_CWSbBkcap-X_QDZWZPMiy7aYrcYio6vK-G33ri3oHUBsP+QTvHnI_JX"
    "TIGRIS_ENDPOINT" = "https://t3.storage.dev"
    "AWS_REGION" = "auto"
    "TIGRIS_BUCKET" = "sendit22"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Adding $key..."
    npx -y vercel env add $key production --value $envVars[$key] --yes 2>&1 | Out-Null
    Write-Host "  Done: $key"
}

Write-Host "`nAll environment variables added!"
