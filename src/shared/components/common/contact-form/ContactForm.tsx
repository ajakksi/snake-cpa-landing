import { useState } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitContactForm } from '@api/endpoints/contact'
import { getApiErrorMessage } from '@api/errors/errors'
import { Button, Input, Select } from '@components/ui'
import { useTranslation } from 'react-i18next'
import {
  createContactFormSchema,
  contactMethods,
  type ContactFormValues,
} from '@validation/contactFormSchema'

type ContactFormProps = {
  onDone?: () => void
}

function ContactForm({ onDone }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { t } = useTranslation(['contactForm', 'common'])
  const contactFormSchema = useMemo(() => createContactFormSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      method: '',
      contact: '',
    },
    mode: 'onSubmit',
  })

  const submitForm = handleSubmit(async (values) => {
    setSubmitError('')

    try {
      // Send validated values through the API layer.
      await submitContactForm(values)
      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  })

  const handleDone = () => {
    // Reset the form so it can be reused from a clean state.
    setIsSubmitted(false)
    reset({
      name: '',
      method: '',
      contact: '',
    })
    onDone?.()
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto flex w-full flex-col items-center px-4 py-8 text-center text-dark">
        <h2 className="text-xl font-bold uppercase leading-[1.1] tracking-tight">
          {t('contactForm:successTitle')}
        </h2>

        <p className="mt-5 text-xl leading-[1.1] font-normal">
          {t('contactForm:successDescription')}
        </p>

        {/* Let the parent close a modal, if the form is rendered inside one. */}
        <Button type="button" onClick={handleDone} className="mt-12">
          {t('common:done')}
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        void submitForm(event)
      }}
      className="mx-auto w-full px-4 py-8 text-dark font-light"
      noValidate
    >
      <p className="text-sm leading-tight text-dark md:text-sm">
        {t('contactForm:mandatoryFields')}
      </p>

      <div className="mt-6 space-y-3">
        <Input
          label={t('contactForm:labels.name')}
          placeholder={t('contactForm:labels.name')}
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid gap-3 md:grid-cols-[0.95fr_1.45fr]">
          <Select
            label={t('contactForm:labels.contactMethod')}
            placeholder={`${t('contactForm:labels.contactMethod')} *`}
            options={contactMethods}
            {...register('method')}
            error={errors.method?.message}
          />

          <Input
            label={t('contactForm:labels.yourContact')}
            placeholder={`${t('contactForm:labels.yourContact')} *`}
            autoComplete="off"
            {...register('contact')}
            error={errors.contact?.message}
          />
        </div>

        {submitError ? (
          <p className="px-1 text-[0.75rem] leading-none text-red-600">{submitError}</p>
        ) : null}
      </div>

      <div className="mt-8 flex justify-center">
        <Button type="submit" className="min-w-[8rem]" disabled={isSubmitting}>
          {t('common:submit')}
        </Button>
      </div>
    </form>
  )
}

export default ContactForm
